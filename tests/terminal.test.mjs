import test from 'node:test';
import assert from 'node:assert/strict';
import { completeTerminalCommand, executeTerminalCommand } from '../src/lib/terminal.ts';

test('help descubre los comandos disponibles', () => {
  const result = executeTerminalCommand('help');

  assert.equal(result.kind, 'output');
  assert.match(result.lines.join('\n'), /whoami/);
  assert.match(result.lines.join('\n'), /open <destino>/);
});

test('los comandos de perfil devuelven información del portfolio', () => {
  assert.match(executeTerminalCommand('whoami').lines.join('\n'), /Jesús Aragón/);
  assert.match(executeTerminalCommand('skills').lines.join('\n'), /Astro/);
  assert.match(executeTerminalCommand('experience').lines.join('\n'), /ALTEN/);
});

test('el sistema de archivos simulado permite listar y leer documentos', () => {
  assert.match(executeTerminalCommand('ls').lines.join('\n'), /about\.txt/);
  assert.match(executeTerminalCommand('cat about.txt').lines.join('\n'), /Cádiz/);
  assert.match(executeTerminalCommand('cat missing.txt').lines.join('\n'), /no existe/i);
});

test('open solo navega a destinos internos conocidos', () => {
  assert.deepEqual(executeTerminalCommand('open orbita'), { kind: 'navigate', lines: [], value: 'orbita' });
  assert.match(executeTerminalCommand('open internet').lines.join('\n'), /destino desconocido/i);
});

test('clear solicita limpiar la sesión', () => {
  assert.deepEqual(executeTerminalCommand('clear'), { kind: 'clear', lines: [] });
});

test('theme acepta las tres paletas del terminal', () => {
  assert.deepEqual(executeTerminalCommand('theme amber'), { kind: 'theme', lines: ['Tema amber activado.'], value: 'amber' });
  assert.match(executeTerminalCommand('theme pink').lines.join('\n'), /green · amber · ice/);
});

test('projects enumera las 30 experiencias navegables', () => {
  const result = executeTerminalCommand('projects');

  assert.equal(result.lines.length, 30);
  assert.match(result.lines.at(-1), /veta/);
});

test('la consola responde a texto libre y explica los comandos desconocidos', () => {
  assert.deepEqual(executeTerminalCommand('echo hola mundo').lines, ['hola mundo']);
  assert.match(executeTerminalCommand('hack nasa').lines.join('\n'), /comando no encontrado/i);
});

test('tab completa comandos y destinos sin inventar opciones', () => {
  assert.equal(completeTerminalCommand('wh'), 'whoami');
  assert.equal(completeTerminalCommand('open or'), 'open orbita');
  assert.equal(completeTerminalCommand('x'), 'x');
});
