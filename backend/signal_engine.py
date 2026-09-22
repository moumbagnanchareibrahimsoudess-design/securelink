def create_signal(
    signal_type: str,
    signal_value: str,
    signal_source: str,
    evidence: str,
    confidence: float,
    category: str = None    

    

    
):
    return {
        "type": signal_type,
        "value": signal_value,
        "source": signal_source,
        "evidence": evidence,
        "confidence": confidence,
        "category": category
    }
if __name__ == "__main__":
    signal = create_signal(
        signal_type="urgency",
        signal_value="immediatement",
        signal_source="message",
        evidence="Le mot 'immediatement' a été détecté dans le message.",
        confidence=0.9,
        category="pressure"
    )
    print(signal)