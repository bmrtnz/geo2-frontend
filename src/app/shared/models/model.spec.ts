import { toArray } from 'rxjs/operators';
import { Field, Model, ModelFieldOptions, ModelName } from 'app/shared/models/model';
import { GridColumn } from 'basic';

@ModelName('Stamp')
class Stamp extends Model {
  @Field({ asKey: true }) public id?: number;
  @Field({ dataType: 'date' }) public moment?: string;
}

@ModelName('Type')
class Type extends Model {
  @Field({ asKey: true }) public id?: number;
  @Field({ asLabel: true }) public label?: string;
  @Field() public typeDescription?: string;
  @Field({ model: Promise.resolve({ default: Stamp }) }) public stamp?: Stamp;
}

@ModelName('Entity')
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
        typeDescription: 'Type description',
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
          expect(fields.length).toEqual(7);
          expect(fields).toContain('id');
          expect(fields).toContain('description');
          expect(fields).toContain('valide');
          expect(fields).toContain('type.id');
          expect(fields).toContain('type.label');
          expect(fields).toContain('type.typeDescription');
          done();
        });
    });

    it('with depth', (done) => {
      Entity.getListFields(2)
        .pipe(toArray())
        .subscribe(fields => {
          expect(fields.length).toEqual(8);
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
          expect(fields).toMatch(/type {id label}/);
          done();
        });
    });

    it('with depth', (done) => {
      Entity.getGQLFields(2)
        .subscribe(fields => {
          expect(fields).toMatch(/type {.*stamp {id}.*}/);
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

    it('with filter and depth', (done) => {
      Entity.getGQLFields(1, /^(valide|type.typeDescription)$/, null, {forceFilter: true})
        .subscribe(fields => {
          expect(fields).toMatch(/valide type {typeDescription}/);
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
          expect(fields.length).toEqual(7);
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

    it('with filter (forcedFilter options)', (done) => {
      Entity.getDetailedFields(1, /description$/, {forceFilter: true})
        .subscribe(fields => {
          expect(fields.length).toEqual(1);
          expect(fields).toContain(jasmine.objectContaining({
            path: 'description',
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
    });

  });

  describe('should handle getGraphQL', () => {

    it('should return graphQL query with GridBaseConfig', (done) => {
      const columns: GridColumn[] = [
        {
          visibleIndex: 0,
          dataField: 'nom',
          dataType: 'string',
          visible: true
        },
        {
          visibleIndex: 1,
          dataField: 'prenom',
          dataType: 'string',
          visible: true
        },
        {
          visibleIndex: 2,
          dataField: 'moyenCommunication.description',
          dataType: 'string',
          width: 250,
          visible: true
        }
      ];

      Model
        .getGQLObservable(columns.map(property => property.dataField))
        .subscribe(result => {
          expect(result).toMatch(/nom\nprenom\nmoyenCommunication{\ndescription\n}/);
          done();
        });
    });

    it('should return graphQL query with gridBaseConfig in depth', (done) => {
      Model
        .getGQLObservable(['adresse1', 'adresse2', 'societe.adresse3', 'societe.pays.ville', 'societe.pays.codePostal'])
        .subscribe(result => {
          expect(result).toMatch(/adresse1\nadresse2\nsociete{\nadresse3\npays{\ncodePostal\nville\n}\n}/);
          done();
        });
    });

    it('should return graphQL query with string params', (done) => {
      Model
        .getGQLObservable(['nom', 'prenom', 'moyenCommunication.id', 'moyenCommunication.description'])
        .subscribe(result => {
          expect(result).toMatch(/nom\nprenom\nmoyenCommunication{\ndescription\nid\n}/);
          done();
        });
    });

    it('should return empty string with empty array', (done) => {
      Model
        .getGQLObservable([])
        .subscribe(result => {
          expect(result).toEqual('');
          done();
        });
    });

    it('should return empty string with no param', (done) => {
      Model
        .getGQLObservable()
        .subscribe(result => {
          expect(result).toEqual('');
          done();
        });
    });

  });
});
