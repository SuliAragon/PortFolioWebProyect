export type TerminalResult = {
  kind: 'output' | 'clear' | 'navigate' | 'theme';
  lines: string[];
  value?: string;
};

const destinations: Record<string, string> = {
  cv: '',
  inicio: '',
  pelago: 'pelago',
  forma: 'forma',
  orbita: 'orbita',
  pulso: 'pulso',
  bruma: 'bruma',
  umbral: 'umbral',
  miga: 'miga',
  cota: 'cota',
  nexo: 'nexo',
  terminal: 'terminal',
  crudo: 'crudo',
};

const commands = ['help', 'whoami', 'ls', 'projects', 'experience', 'skills', 'cat', 'open', 'theme', 'date', 'echo', 'clear'];

export function completeTerminalCommand(rawCommand: string): string {
  const input = rawCommand.trimStart().toLowerCase();

  if (input.startsWith('open ')) {
    const fragment = input.slice(5);
    const match = Object.keys(destinations).find(destination => destination.startsWith(fragment));
    return match ? `open ${match}` : rawCommand;
  }

  const match = commands.find(command => command.startsWith(input));
  return match || rawCommand;
}

export function executeTerminalCommand(rawCommand: string): TerminalResult {
  const input = rawCommand.trim();
  const command = input.toLowerCase();

  const files: Record<string, string[]> = {
    'about.txt': [
      'Jesús Aragón · desarrollador de aplicaciones en Cádiz.',
      'Código claro, curiosidad visual y productos que se entienden al usarlos.',
    ],
    'skills.json': [
      '{',
      '  "frontend": ["Astro", "TypeScript", "Three.js"],',
      '  "backend": ["Java", "Spring", "Python"],',
      '  "data": ["SQL", "Big Data", "Power BI"]',
      '}',
    ],
    'contact.txt': ['j.aragonmonzon@gmail.com', 'Cádiz · disponible para crear algo interesante'],
  };

  const profileCommands: Record<string, string[]> = {
    whoami: [
      'Jesús Aragón Monzón',
      'Desarrollador de aplicaciones · Cádiz',
      'Construyo interfaces, servicios y experiencias digitales con intención.',
    ],
    skills: [
      'FRONTEND  Astro · TypeScript · JavaScript · HTML · CSS',
      'BACKEND   Java · Spring · Python · APIs REST',
      'DATOS     SQL · Big Data · Power BI',
      'CREATIVE  Three.js · diseño de interacción',
    ],
    experience: [
      'ALTEN Spain / Airbus — desarrollo y datos',
      'Xebia — desarrollo de aplicaciones',
      'Escribe “open cv” para abrir el currículum completo.',
    ],
    projects: [
      '01  cv        perfil profesional',
      '02  pelago    retiro oceánico',
      '03  forma     arquitectura',
      '04  orbita    sistema solar',
      '05  pulso     cultura electrónica',
      '06  bruma     perfumería',
      '07  umbral    galería digital',
      '08  miga      obrador',
      '09  cota      expedición alpina',
      '10  nexo      inteligencia aplicada',
      '11  terminal  consola interactiva',
      '12  crudo     taller brutalista',
    ],
  };

  if (profileCommands[command]) return { kind: 'output', lines: profileCommands[command] };

  if (command === 'ls') return { kind: 'output', lines: [Object.keys(files).join('   '), 'projects/'] };

  if (command.startsWith('cat ')) {
    const file = command.slice(4).trim();
    return files[file]
      ? { kind: 'output', lines: files[file] }
      : { kind: 'output', lines: [`cat: ${file || '?'}: el archivo no existe`] };
  }

  if (command.startsWith('open ')) {
    const target = command.slice(5).trim();
    return target in destinations
      ? { kind: 'navigate', lines: [], value: destinations[target] }
      : { kind: 'output', lines: [`open: ${target || '?'}: destino desconocido`, 'Prueba “projects” para ver los destinos.'] };
  }

  if (command === 'clear') return { kind: 'clear', lines: [] };

  if (command.startsWith('theme')) {
    const theme = command.slice(5).trim();
    return ['green', 'amber', 'ice'].includes(theme)
      ? { kind: 'theme', lines: [`Tema ${theme} activado.`], value: theme }
      : { kind: 'output', lines: ['Temas disponibles: green · amber · ice'] };
  }

  if (command.startsWith('echo')) return { kind: 'output', lines: [input.slice(4).trim()] };

  if (command === 'date') {
    return { kind: 'output', lines: [new Intl.DateTimeFormat('es-ES', { dateStyle: 'full', timeStyle: 'medium' }).format(new Date())] };
  }

  if (command === 'help') {
    return {
      kind: 'output',
      lines: [
        'COMANDOS DISPONIBLES',
        'help · whoami · ls · projects · experience · skills',
        'cat <archivo> · open <destino> · theme <color> · date · clear',
      ],
    };
  }

  if (!command) return { kind: 'output', lines: [] };

  return { kind: 'output', lines: [`${input}: comando no encontrado`, 'Escribe “help” para ver todo lo que puedes hacer.'] };
}
