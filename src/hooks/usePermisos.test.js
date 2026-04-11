import { describe, it, expect } from 'vitest';
import { usePermisos } from './usePermisos';

// usePermisos es una función pura (no necesita React ni renderizado)
// así que la testemos directamente.

const u = (roles = [], is_superuser = false) => ({ roles, is_superuser });

describe('usePermisos', () => {
  describe('tiene()', () => {
    it('devuelve true si el usuario tiene el rol exacto', () => {
      const { tiene } = usePermisos(u(['ADMIN']));
      expect(tiene('ADMIN')).toBe(true);
    });

    it('devuelve false si el usuario no tiene el rol', () => {
      const { tiene } = usePermisos(u(['CAJERO']));
      expect(tiene('ADMIN')).toBe(false);
    });

    it('devuelve true si es superuser aunque no tenga roles', () => {
      const { tiene } = usePermisos(u([], true));
      expect(tiene('ADMIN')).toBe(true);
    });

    it('acepta múltiples roles (OR)', () => {
      const { tiene } = usePermisos(u(['BODEGA']));
      expect(tiene('ADMIN', 'BODEGA')).toBe(true);
    });
  });

  describe('esAdmin()', () => {
    it('es true para ADMIN', () => expect(usePermisos(u(['ADMIN'])).esAdmin()).toBe(true));
    it('es false para CAJERO', () => expect(usePermisos(u(['CAJERO'])).esAdmin()).toBe(false));
    it('es true para superuser', () => expect(usePermisos(u([], true)).esAdmin()).toBe(true));
  });

  describe('esSupervisor()', () => {
    it('es true para ADMIN', () => expect(usePermisos(u(['ADMIN'])).esSupervisor()).toBe(true));
    it('es true para SUPERVISOR', () => expect(usePermisos(u(['SUPERVISOR'])).esSupervisor()).toBe(true));
    it('es false para CAJERO', () => expect(usePermisos(u(['CAJERO'])).esSupervisor()).toBe(false));
  });

  describe('esCajero()', () => {
    it('es true para CAJERO', () => expect(usePermisos(u(['CAJERO'])).esCajero()).toBe(true));
    it('es true para ADMIN', () => expect(usePermisos(u(['ADMIN'])).esCajero()).toBe(true));
    it('es false para BODEGA', () => expect(usePermisos(u(['BODEGA'])).esCajero()).toBe(false));
  });

  describe('esBodega()', () => {
    it('es true para BODEGA', () => expect(usePermisos(u(['BODEGA'])).esBodega()).toBe(true));
    it('es true para CAJERO', () => expect(usePermisos(u(['CAJERO'])).esBodega()).toBe(true));
    it('es false para usuario sin roles', () => expect(usePermisos(u([])).esBodega()).toBe(false));
  });

  describe('usuario nulo o sin roles', () => {
    it('no lanza error si usuario es null', () => {
      const { tiene } = usePermisos(null);
      expect(tiene('ADMIN')).toBe(false);
    });

    it('no lanza error si roles está indefinido', () => {
      const { esAdmin } = usePermisos({});
      expect(esAdmin()).toBe(false);
    });
  });
});
