import sys
import os
from pathlib import Path
import multiprocessing as mp
import warnings

# Suppress resource_tracker semaphore leak warnings
warnings.filterwarnings(
    "ignore",
    ".*leaked semaphore objects.*",
    category=UserWarning,
    module="multiprocessing.resource_tracker"
)

# =============================================
# PATH CONFIGURATION - GUARANTEED TO WORK
# =============================================
# Get absolute path to current file's directory (src/)
CURRENT_DIR = Path(__file__).parent.absolute()
PROJECT_ROOT = CURRENT_DIR.parent.absolute()  # Goes up to ChatBotMI/

# Add to Python path for imports
sys.path.append(str(CURRENT_DIR))

# Import from local files (no 'src.' prefix)
from data_processing import load_dataset, preprocess_data
from chatbot_model import MedicalChatbot

# Dataset path - adjust if your structure differs
DATASET_PATH = PROJECT_ROOT / "data" / "final_chatbot_medical_dataset_multilingual.csv"

# =============================================
# DEBUGGING OUTPUT - VERIFY THESE PATHS
# =============================================

if not DATASET_PATH.exists():
    print(f" ERROR: Dataset not found at {DATASET_PATH}")
    print("Please verify:")
    print(f"1. The file exists at this exact path")
    print(f"2. The filename is spelled exactly as shown above")
    sys.exit(1)

# =============================================
# CHATBOT SERVICE CLASS
# =============================================
class ChatbotService:
    def __init__(self):
        self.chatbot = None
        self.initialize_chatbot()

    def initialize_chatbot(self):
        """Initialize the chatbot with dataset"""
        try:
            df = load_dataset(str(DATASET_PATH))
            processed_data = preprocess_data(df)
            self.chatbot = MedicalChatbot(*processed_data)
            return True
        except Exception as e:
            print(f" Failed to initialize chatbot: {str(e)}", file=sys.stderr)
            return False

    def process_query(self, query):
        """Process a user query and return response"""
        if not self.chatbot:
            return "Chatbot initialization failed. Please check logs."
        
        try:
            # Special commands
            if query.lower() in ['symptoms', 'symptômes', 'الأعراض']:
                return self.chatbot.process_query("symptoms")
            
            return self.chatbot.process_query(query)
        except Exception as e:
            print(f"Error processing query: {e}", file=sys.stderr)
            return "An error occurred while processing your request."

# =============================================
# CLI MODE
# =============================================
def run_cli():
    """Run the chatbot in CLI mode"""
    service = ChatbotService()
    if not service.chatbot:
        return

    print("\n" + "="*50)
    print("=== Medical Chatbot ===")
    print("Welcome to our healthcare support system. Please describe your symptoms")
    print("="*50 + "\n")

    while True:
        try:
            user_input = input(">> ").strip()
            if user_input.lower() in ['quit', 'exit', 'quitter']:
                print("\n  Goodbye, stay safe, Thank you for using our medical assistance service.!")
                break
            
            response = service.process_query(user_input)
            print(response)
        except KeyboardInterrupt:
            print("\nGoodbye, stay safe, Thank you for using our medical assistance service.")
            break
        except Exception as e:
            print(f"Error: {e}")

# =============================================
# MAIN EXECUTION
# =============================================
if __name__ == "__main__":
    # Use spawn start method to avoid semaphore leaks
    try:
        mp.set_start_method("spawn", force=True)
    except RuntimeError:
        pass  # start method already set

    if len(sys.argv) > 1:
        # API Mode - Called from Node.js
        service = ChatbotService()
        if service.chatbot:
            query = ' '.join(sys.argv[1:])
            response = service.process_query(query)
            print(response)
        else:
            print("❌ Le service Chatbot n'a pas pu être initialisé.")
            sys.exit(1)
    else:
        # CLI Mode
        run_cli()
