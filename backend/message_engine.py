from email.mime import message

from signal_engine import create_signal
from pressure_knowledge import pressure_knowledge
from financial_knowledge import financial_knowledge
from credential_knowledge import credential_knowledge

def detect_urgency(message):
    urgency_words = pressure_knowledge["words"] + pressure_knowledge["phases"] + pressure_knowledge["variants"] 
    message_lower = message.lower()
    signals = []
    for word in urgency_words:
        if word in message_lower:
            return word
    return None
def detect_money(message):
    money_words = financial_knowledge["words"] + financial_knowledge["phases"] + financial_knowledge["variants"]
    message_lower = message.lower()
    for word in money_words:
        if word in message_lower:
            return word
    return None
    
def detect_sensitive_data(message):
     sensitive_words = credential_knowledge["words"] + credential_knowledge["phases"] + credential_knowledge["variants"]
     message_lower = message.lower()
     for word in sensitive_words:
        if word in message_lower:
              return word
     return None
def analyse_message(message):
    signals = []

    urgency = detect_urgency(message)
    if urgency:
        signals.append(create_signal(
            signal_type="urgency",
            signal_value=urgency,
            signal_source="message",
            evidence=f"Le mot '{urgency}' a été détecté dans le message.",
            confidence=0.9,
            category="pressure"
        ))

    money = detect_money(message)
    if money:
        signals.append(create_signal(
            signal_type="money",
            signal_value=money,
            signal_source="message",
            evidence=f"Le mot '{money}' a été détecté dans le message.",
            confidence=0.8,
            category="financial"
        ))

    sensitive_data = detect_sensitive_data(message)
    if sensitive_data:
        signals.append(create_signal(
            signal_type="sensitive_data",
            signal_value=sensitive_data,
            signal_source="message",
            evidence=f"Le mot '{sensitive_data}' a été détecté dans le message.",
            confidence=0.9,
            category="credential"
        ))

    return {
        "message": message,
        "signals": signals
    }
        
    s
if __name__ == "__main__":
    message = input("Entrer un message a analyser : ")  
    result = analyse_message(message)
    print(result)