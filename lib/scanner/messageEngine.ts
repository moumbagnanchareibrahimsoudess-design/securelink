import { Signal } from "./types";
import { createSignal } from "./signalEngine";
import { pressureKnowledge, financialKnowledge, credentialKnowledge } from "./knowledge";

export function detectUrgency(message: string): string | null {
  const urgencyWords = [
    ...pressureKnowledge.words,
    ...pressureKnowledge.phases,
    ...pressureKnowledge.variants,
  ];
  const messageLower = message.toLowerCase();
  for (const word of urgencyWords) {
    if (messageLower.includes(word.toLowerCase())) {
      return word;
    }
  }
  return null;
}

export function detectMoney(message: string): string | null {
  const moneyWords = [
    ...financialKnowledge.words,
    ...financialKnowledge.phases,
    ...financialKnowledge.variants,
  ];
  const messageLower = message.toLowerCase();
  for (const word of moneyWords) {
    if (messageLower.includes(word.toLowerCase())) {
      return word;
    }
  }
  return null;
}

export function detectSensitiveData(message: string): string | null {
  const sensitiveWords = [
    ...credentialKnowledge.words,
    ...credentialKnowledge.phases,
    ...credentialKnowledge.variants,
  ];
  const messageLower = message.toLowerCase();
  for (const word of sensitiveWords) {
    if (messageLower.includes(word.toLowerCase())) {
      return word;
    }
  }
  return null;
}

export interface MessageAnalysisResult {
  message: string;
  signals: Signal[];
}

export function analyzeMessage(message: string): MessageAnalysisResult {
  const signals: Signal[] = [];

  const urgency = detectUrgency(message);
  if (urgency) {
    signals.push(
      createSignal(
        "urgency",
        urgency,
        "message",
        `Le mot '${urgency}' a été détecté dans le message.`,
        0.9,
        "pressure"
      )
    );
  }

  const money = detectMoney(message);
  if (money) {
    signals.push(
      createSignal(
        "money",
        money,
        "message",
        `Le mot '${money}' a été détecté dans le message.`,
        0.8,
        "financial"
      )
    );
  }

  const sensitiveData = detectSensitiveData(message);
  if (sensitiveData) {
    signals.push(
      createSignal(
        "sensitive_data",
        sensitiveData,
        "message",
        `Le mot '${sensitiveData}' a été détecté dans le message.`,
        0.9,
        "credential"
      )
    );
  }

  return {
    message,
    signals,
  };
}
