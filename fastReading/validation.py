import json

def validate_quiz_json(filepath):
    with open(filepath, 'r', encoding='utf-8') as file:
        data = json.load(file)
    
    if "questions" not in data:
        return False
    
    for question in data["questions"]:
        if not all(key in question for key in ["question", "options", "correct_answer"]):
            return False
        if not isinstance(question["options"], list) or len(question["options"]) != 4:
            return False
        if question["correct_answer"] not in question["options"]:
            return False
    
    return True