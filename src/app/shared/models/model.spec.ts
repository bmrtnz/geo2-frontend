import { toArray } from 'rxjs/operators';
import { Field, Model, ModelFieldOptions } from '../models/model';

class Stamp extends Model {
  @Field({ asKey: true }) public id?: number;
  @Field({ dataType: 'date' }) public moment?: string;
}

class Type extends Model {
  @Field({ asKey: true }) public id?: number;
  @Field({ asLabel: true }) public label?: string;
  @Field({ model: Promise.resolve({ default: Stamp }) }) public stamp?: Stamp;
}

class Entity extends Model {
  @Field({ asKey: true }) public id?: string;
  @Field({ asLabel: true }) public description?: string;
  @Field() public valide?: boolean;
  @Field({ model: Promise.resolve({ default: Type }) }) public type?: Type;
}

describe('Model class', () => {

  let entity: Entity;

  beforeEach(() => {
    entity = new Entity({
      id: '001',
      description: 'The prototype',
      valide: true,
      type: {
        id: 1,
        label: 'prototype',
        stamp: { id: 1, moment: '1970-01-01' },
      },
    });
  });

  it('should be instanced', () => {
    expect(entity).toBeDefined();
    expect(entity.id).toEqual('001');
  });

  describe('should handle getListFields()', () => {

    it('with defaults', (done) => {
      Entity.getListFields()
        .pipe(toArray())
        .subscribe(fields => {
          expect(fields.length).toEqual(5);
          expect(fields).toContain('id');
          expect(fields).toContain('description');
          expect(fields).toContain('valide');
          expect(fields).toContain('type.id');
          expect(fields).toContain('type.label');
          done();
        });
    });

    it('with depth', (done) => {
      Entity.getListFields(2)
        .pipe(toArray())
        .subscribe(fields => {
          expect(fields.length).toEqual(6);
          expect(fields).toContain('type.stamp.id');
          done();
        });
    });

  });

  describe('should handle getGQLFields()', () => {

    it('with defaults', (done) => {
      Entity.getGQLFields()
        .subscribe(fields => {
          expect(fields).toMatch(/^id description/);
          expect(fields).toMatch(/type { id label }/);
          done();
        });
    });

    it('with depth', (done) => {
      Entity.getGQLFields(2)
        .subscribe(fields => {
          expect(fields).toMatch(/type {.*stamp { id }.*}/);
          done();
        });
    });

    it('with filter', (done) => {
      Entity.getGQLFields(1, /id$/)
        .subscribe(fields => {
          expect(fields).not.toContain('valide');
          done();
        });
    });

  });

  describe('should handle getDetailedFields()', () => {

    it('with defaults', (done) => {
      Entity.getDetailedFields()
        .subscribe(fields => {
          expect(fields.length).toEqual(5);
          expect(fields).toContain(jasmine.objectContaining({
            path: 'id',
            asKey: true,
            type: 'String',
          } as ModelFieldOptions));
          expect(fields).toContain(jasmine.objectContaining({
            name: 'description',
            asLabel: true,
          } as ModelFieldOptions));
          expect(fields).toContain(jasmine.objectContaining({
            path: 'type.id',
            asKey: true,
          } as ModelFieldOptions));
          done();
        });
    });

    it('with depth', (done) => {
      Entity.getDetailedFields(2)
        .subscribe(fields => {
          expect(fields.length).toEqual(6);
          expect(fields).toContain(jasmine.objectContaining({
            path: 'type.stamp.id',
            asKey: true,
          } as ModelFieldOptions));
          done();
        });
    });

    it('with filter', (done) => {
      Entity.getDetailedFields(1, /id$/)
        .subscribe(fields => {
          expect(fields.length).toEqual(4);
          expect(fields).not.toContain(jasmine.objectContaining({
            path: 'valide',
          } as ModelFieldOptions));
          done();
        });
    });

  });

  describe('should handle getKeyField()', () => {

    it('should return key field', () => {
      expect(Entity.getKeyField()).toEqual('id');
      expect(Stamp.getKeyField()).toEqual('id');
    });

  });

  describe('should handle getLabelField()', () => {

    it('should return label field', () => {
      expect(Entity.getLabelField()).toEqual('description');
      expect(Type.getLabelField()).toEqual('label');
      expect(Stamp.getLabelField()).toBeFalsy();
    });

  });

  describe('should handle getFields()', () => {

    it('should return fields', () => {
      const fields = Entity.getFields();
      expect(fields.id).toEqual({
        asKey: true,
      } as ModelFieldOptions);
      expect(fields.description).toEqual({
        asLabel: true,
      } as ModelFieldOptions);
      expect(fields.type).toEqual(jasmine.objectContaining({
        fetchedModel: Type,
      }) as ModelFieldOptions);
    });

  });

});
