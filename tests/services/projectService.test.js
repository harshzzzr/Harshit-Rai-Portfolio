import { describe, it, expect, beforeEach } from 'vitest';
import {
  normalizeProject,
  getProjectById,
  SLUG_ALIASES,
  invalidateProjectsCache,
  defaultProjects,
} from '../../src/services/projectService';

describe('Project Service', () => {
  beforeEach(() => {
    invalidateProjectsCache();
  });

  describe('normalizeProject', () => {
    it('normalizes missing fields with robust defaults', () => {
      const raw = {
        title: 'Custom Algorithm',
        features: 'Fast execution\nMemory efficient',
        technologies: 'C++, Python',
      };

      const normalized = normalizeProject(raw, 'custom-algo');

      expect(normalized.id).toBe('custom-algo');
      expect(normalized.slug).toBe('custom-algo');
      expect(normalized.title).toBe('Custom Algorithm');
      expect(normalized.features).toEqual(['Fast execution', 'Memory efficient']);
      expect(normalized.technologies).toEqual(['C++', 'Python']);
      expect(normalized.category).toBe('Engineering');
      expect(normalized.visible).toBe(true);
      expect(normalized.featured).toBe(false);
      expect(normalized.screenshots).toEqual([]);
    });

    it('retains explicit arrays and overrides', () => {
      const raw = {
        id: 'explicit-id',
        title: 'Explicit Title',
        featured: true,
        category: 'Systems',
        features: ['Feature 1', 'Feature 2'],
        technologies: ['Rust', 'WebAssembly'],
        visible: false,
      };

      const normalized = normalizeProject(raw);

      expect(normalized.id).toBe('explicit-id');
      expect(normalized.featured).toBe(true);
      expect(normalized.category).toBe('Systems');
      expect(normalized.features).toHaveLength(2);
      expect(normalized.technologies).toHaveLength(2);
      expect(normalized.visible).toBe(false);
    });
  });

  describe('getProjectById and SLUG_ALIASES', () => {
    it('returns error if project identifier is empty or undefined', async () => {
      const result = await getProjectById(null);
      expect(result.data).toBeNull();
      expect(result.error).toContain('Project identifier is required');
    });

    it('resolves standard project by ID from fallback data', async () => {
      const result = await getProjectById('campus-connect');
      expect(result.data).not.toBeNull();
      expect(result.data.title).toBe('Campus Connect');
    });

    it('resolves project using backward-compatible alias', async () => {
      const alias = 'fullstack-web-platform';
      expect(SLUG_ALIASES[alias]).toBe('campus-connect');

      const result = await getProjectById(alias);
      expect(result.data).not.toBeNull();
      expect(result.data.id).toBe('campus-connect');
      expect(result.data.title).toBe('Campus Connect');
    });

    it('contains all default verified projects', () => {
      expect(defaultProjects.length).toBeGreaterThanOrEqual(5);
      const projectIds = defaultProjects.map((p) => p.id);
      expect(projectIds).toContain('campus-connect');
      expect(projectIds).toContain('drone-detection');
      expect(projectIds).toContain('vip-framework');
    });
  });
});
