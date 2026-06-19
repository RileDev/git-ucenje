import type { AssistantChar } from './types';

export const assistantImage = (a: AssistantChar): string =>
  a === 'doge' ? 'doge.png' : a === 'snake' ? 'snake.png' : 'bonzi.png';

export const assistantName = (a: AssistantChar): string =>
  a === 'doge' ? 'Gitko Doge' : a === 'snake' ? 'Solid Snake' : 'BonziBuddy';

// Welcome string shown when the user clicks on the floating Gitko character.
export const assistantWelcome = (a: AssistantChar): string => {
  const messages: Record<AssistantChar, string> = {
    doge:  'Ja sam Gitko Doge! Mnogo git, vrlo grana, vau! Klikni na ikone na radnoj površini da otvoriš Git Graf ili Uputstvo.',
    snake: 'Snake ovde. Pukovniče, ušao sam u Git repozitorijum. Pazi na konflikte, over.',
    bonzi: 'Zdravo! Ja sam tvoj najbolji ljubičasti drugar BonziBuddy! Hoćeš li da ti ispričam vic o programerima? 🍇',
  };
  return messages[a];
};
