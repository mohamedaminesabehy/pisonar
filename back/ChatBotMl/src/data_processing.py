import pandas as pd
import os

def load_dataset(file_path):
    """
    Charge le dataset CSV multilingue.
    Args:
        file_path (str): Chemin vers le fichier CSV.
    Returns:
        pd.DataFrame: Dataset chargé.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Le fichier {file_path} n'existe pas.")
    
    df = pd.read_csv(file_path)

    # Colonnes à convertir en minuscules (si elles existent dans le fichier)
    expected_columns = ['Symptom_EN', 'Symptom_FR', 'Symptom_AR', 
                        'Illness_EN', 'Illness_FR', 'Illness_AR', 
                        'Recommended_Medication']
    
    for col in expected_columns:
        if col in df.columns:
            df[col] = df[col].astype(str).str.lower()
    
    return df

def preprocess_data(df):
    """
    Prétraitement des données pour le chatbot multilingue.
    Returns:
        dict: Symptômes (multi-langue) vers réponse (médicaments ou spécialité médicale).
        dict: Maladies vers médicaments.
        list: Symptômes disponibles.
        dict: Symptômes graves vers spécialités.
        dict: Maladies vers informations de gravité.
    """
    symptom_to_response = {}
    illness_to_med = {}
    symptoms_list = []
    serious_symptom_to_doctor = {}
    illness_to_serious_info = {}
    
    for _, row in df.iterrows():
        symptom_en = str(row.get('Symptom_EN', '')).strip().lower()
        symptom_fr = str(row.get('Symptom_FR', '')).strip().lower()
        symptom_ar = str(row.get('Symptom_AR', '')).strip().lower()
        illness_en = str(row.get('Illness_EN', '')).strip().lower()
        illness_fr = str(row.get('Illness_FR', '')).strip().lower()
        illness_ar = str(row.get('Illness_AR', '')).strip().lower()
        medication = str(row.get('Recommended_Medication', '')).strip().lower()
        is_serious = bool(row.get('Serious', False))
        doctor_specialty = str(row.get('Doctor_Specialty', '')).strip().lower() if is_serious else None

        for symptom in [symptom_en, symptom_fr, symptom_ar]:
            if symptom and symptom not in symptoms_list:
                symptoms_list.append(symptom)

        for symptom in [symptom_en, symptom_fr, symptom_ar]:
            if not symptom:
                continue
            if is_serious:
                symptom_to_response[symptom] = {'type': 'doctor', 'response': doctor_specialty}
                serious_symptom_to_doctor[symptom] = doctor_specialty
            else:
                if symptom not in symptom_to_response or symptom_to_response[symptom]['type'] != 'medication':
                    symptom_to_response[symptom] = {'type': 'medication', 'response': []}
                # Sécurité si ce n’est pas une liste
                if not isinstance(symptom_to_response[symptom]['response'], list):
                    symptom_to_response[symptom]['response'] = []
                if medication and medication not in symptom_to_response[symptom]['response']:
                    symptom_to_response[symptom]['response'].append(medication)

        for illness in [illness_en, illness_fr, illness_ar]:
            if not illness:
                continue
            if illness not in illness_to_med:
                illness_to_med[illness] = []
            if medication and medication not in illness_to_med[illness]:
                illness_to_med[illness].append(medication)

        for illness in [illness_en, illness_fr, illness_ar]:
            if not illness:
                continue
            if is_serious:
                illness_to_serious_info[illness] = {'serious': True, 'specialty': doctor_specialty}
            elif illness not in illness_to_serious_info:
                illness_to_serious_info[illness] = {'serious': False, 'specialty': None}
    
    return symptom_to_response, illness_to_med, symptoms_list, serious_symptom_to_doctor, illness_to_serious_info
