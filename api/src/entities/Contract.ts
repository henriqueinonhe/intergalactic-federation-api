import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { Pilot } from "./Pilot";
import { Planet } from "./Planet";
import { v4 as uuid } from "uuid";
import { Resource } from "./Resource";

@Entity("Contracts")
export class Contract {
  @PrimaryColumn({
    type: "varchar",
    nullable: false
  })
  public id : string;

  @Column({
    type: "varchar",
    nullable: false
  })
  public description : string;

  @Column({
    type: "varchar",
    nullable: false
  })
  public originPlanetId : string;

  @ManyToOne(() => Planet, planet => planet.originContracts)
  originPlanet : Planet;

  @Column({
    type: "varchar",
    nullable: false
  })
  public destinationPlanetId : string;

  @ManyToOne(() => Planet, planet => planet.destinationContracts)
  public destinationPlanet : Planet;

  @Column({
    type: "decimal",
    precision: 21,
    scale: 4,
    nullable: false
  })
  public value : string;

  @Column({
    type: "varchar",
    nullable: true
  })
  public contracteeId : string | null;

  @ManyToOne(() => Pilot, pilot => pilot.contracts)
  public contractee : Pilot | null;

  @OneToMany(() => Resource, resource => resource.contract)
  public payload : Array<Resource>;

  @Column({
    type: "timestamp",
    nullable: true
  })
  public fulfilledAt : string | null;

  @CreateDateColumn({
    type: "timestamp",
    nullable: false
  })
  public createdAt : Date;

  @UpdateDateColumn({
    type: "timestamp",
    nullable: false
  })
  public updatedAt : Date;

  constructor() {
    if(!this.id) {
      this.id = uuid();
    }
  }
}