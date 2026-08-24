export const formatGreeting = (template: string, name: string) => {
  return template.replace('{name}', name);
};
