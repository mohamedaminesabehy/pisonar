import re
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from rapidfuzz import fuzz
from langdetect import detect

class MedicalChatbot:
    def __init__(self, symptom_to_response, illness_to_med, symptoms_list, serious_symptom_to_doctor, illness_to_serious_info):
        """
        Initialise le chatbot médical avec un modèle ML multilingue.
        Args:
            symptom_to_response (dict): Mapping des symptômes aux réponses (médicaments ou médecin).
            illness_to_med (dict): Mapping des maladies aux médicaments.
            symptoms_list (list): Liste des symptômes disponibles.
            serious_symptom_to_doctor (dict): Mapping des symptômes graves aux spécialités médicales.
            illness_to_serious_info (dict): Mapping des maladies aux informations de gravité.
        """
        self.symptom_to_response = symptom_to_response
        self.illness_to_med = illness_to_med
        self.symptoms_list = symptoms_list
        self.serious_symptom_to_doctor = serious_symptom_to_doctor
        self.illness_to_serious_info = illness_to_serious_info
        
        # Mots vides multilingues
        self.stop_words = {
            'en': ['i', 'have', 'my', 'a', 'the', 'of', 'for', 'with'],
            'fr': ['j', 'ai', 'je', 'à', 'la', 'le', 'de', 'des', 'du', 'une', 'un'],
            'ar': ['أنا', 'لدي', 'عندي', 'في', 'مع', 'من', 'إلى']
        }
        
        # Charger le modèle SentenceTransformer multilingue
        self.model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
        
        # Calculer les embeddings des symptômes
        self.symptom_embeddings = self.model.encode(self.symptoms_list, convert_to_tensor=False)

    def detect_language(self, query):
        """
        Détecte la langue de la requête.
        Args:
            query (str): Requête de l'utilisateur.
        Returns:
            str: Code de langue ('en', 'fr', 'ar').
        """
        try:
            lang = detect(query)
            if lang in ['en', 'fr', 'ar']:
                return lang
            return 'en'  # Par défaut
        except:
            return 'en'

    def preprocess_query(self, query, lang):
        """
        Prétraitement de la requête en supprimant les mots vides.
        Args:
            query (str): Requête de l'utilisateur.
            lang (str): Langue détectée.
        Returns:
            str: Requête nettoyée.
        """
        query = query.lower().strip()
        stop_words = self.stop_words.get(lang, self.stop_words['en'])
        
        # Supprimer les mots vides
        for stop_word in stop_words:
            query = re.sub(r'\b' + stop_word + r'\b', '', query)
        query = ' '.join(query.split())
        return query

    def fuzzy_match(self, query, candidates, threshold=90):
        """
        Recherche floue pour corriger les fautes d'orthographe.
        Args:
            query (str): Requête de l'utilisateur.
            candidates (list): Liste des symptômes possibles.
            threshold (int): Seuil de similarité pour accepter une correspondance.
        Returns:
            str or None: Symptôme correspondant ou None si aucune correspondance.
        """
        for candidate in candidates:
            if fuzz.ratio(query, candidate) > threshold:
                return candidate
        return None

    def process_query(self, query):
        """
        Traite la requête de l'utilisateur en utilisant la similarité sémantique et la recherche floue.
        Args:
            query (str): Requête de l'utilisateur.
        Returns:
            str: Réponse du chatbot.
        """
        # Détecter la langue
        lang = self.detect_language(query)
        
        # Prétraiter la requête
        cleaned_query = self.preprocess_query(query, lang)
        
        # Messages de réponse selon la langue
        messages = {
            'en': {
                'illness_response': "For the illness '{illness}', the recommended medications are: {meds}. Please consult a doctor for confirmation.",
                'serious_illness_response': "The illness '{illness}' may be serious. Please consult a {specialty} as soon as possible.",
                'serious_response': "The symptom '{symptom}' may be serious. Please consult a {specialty} as soon as possible.",
                'medication_response': "For the symptom '{symptom}', the recommended medications are: {meds}. Please consult a doctor for confirmation.",
                'not_understood': "I didn't understand what you mean.",
                'symptoms_list': "Recognized symptoms: {symptoms}"
            },
            'fr': {
                'illness_response': "Pour la maladie '{illness}', les médicaments recommandés sont : {meds}. Veuillez consulter un médecin pour confirmation.",
                'serious_illness_response': "La maladie '{illness}' peut être grave. Veuillez consulter un {specialty} dès que possible.",
                'serious_response': "Le symptôme '{symptom}' peut être grave. Veuillez consulter un {specialty} dès que possible.",
                'medication_response': "Pour le symptôme '{symptom}', les médicaments recommandés sont : {meds}. Veuillez consulter un médecin pour confirmation.",
                'not_understood': "Je n'ai pas compris ce que vous voulez dire.",
                'symptoms_list': "Symptômes reconnus : {symptoms}"
            },
            'ar': {
                'illness_response': "بالنسبة للمرض '{illness}'، الأدوية الموصى بها هي: {meds}. يرجى استشارة طبيب للتأكيد.",
                'serious_illness_response': "المرض '{illness}' قد يكون خطيرًا. يرجى استشارة {specialty} في أقرب وقت ممكن.",
                'serious_response': "العرض '{symptom}' قد يكون خطيرًا. يرجى استشارة {specialty} في أقرب وقت ممكن.",
                'medication_response': "بالنسبة للعرض '{symptom}'، الأدوية الموصى بها هي: {meds}. يرجى استشارة طبيب للتأكيد.",
                'not_understood': "لم أفهم ما تقصده.",
                'symptoms_list': "الأعراض المعترف بها: {symptoms}"
            }
        }
        
        # Vérifier les maladies (recherche exacte)
        for illness in self.illness_to_med:
            if illness in cleaned_query:
                serious_info = self.illness_to_serious_info.get(illness, {'serious': False, 'specialty': None})
                if serious_info['serious']:
                    return messages[lang]['serious_illness_response'].format(illness=illness, specialty=serious_info['specialty'])
                medications = self.illness_to_med[illness]
                return messages[lang]['illness_response'].format(illness=illness, meds=', '.join(medications))
        
        # Recherche floue pour corriger les fautes
        fuzzy_match = self.fuzzy_match(cleaned_query, self.symptoms_list)
        if fuzzy_match:
            med_info = self.symptom_to_response[fuzzy_match]
            best_sym = fuzzy_match
            if med_info['type'] == 'doctor':
                return messages[lang]['serious_response'].format(symptom=best_sym, specialty=med_info['response'])
            else:
                return messages[lang]['medication_response'].format(symptom=best_sym, meds=', '.join(med_info['response']))
        
        # Calculer l'embedding de la requête
        query_embedding = self.model.encode([cleaned_query], convert_to_tensor=False)
        
        # Calculer la similarité cosinus
        similarities = cosine_similarity(query_embedding, self.symptom_embeddings)[0]
        
        # Trouver le symptôme le plus similaire
        max_similarity_idx = np.argmax(similarities)
        max_similarity = similarities[max_similarity_idx]
        
        # Seuil de similarité plus strict
        if max_similarity > 0.7:
            best_sym = self.symptoms_list[max_similarity_idx]
            med_info = self.symptom_to_response[best_sym]
            if med_info['type'] == 'doctor':
                return messages[lang]['serious_response'].format(symptom=best_sym, specialty=med_info['response'])
            else:
                return messages[lang]['medication_response'].format(symptom=best_sym, meds=', '.join(med_info['response']))
        
        # Si aucune correspondance pertinente, répondre "Je n'ai pas compris"
        return messages[lang]['not_understood']