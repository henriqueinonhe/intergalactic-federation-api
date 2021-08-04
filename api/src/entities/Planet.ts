import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { v4 as uuid } from "uuid";
import { Contract } from "./Contract";
import { Pilot } from "./Pilot";

@Entity("Planets")
export class Planet {
  @PrimaryColumn({
    type: "varchar",
    nullable: false
  })
  public id : string;

  @Column({
    type: "varchar",
    nullable: false
  })
  public name : string;

  @OneToMany(() => Contract, contract => contract.originPlanet)
  public originContracts : Array<Contract>;

  @OneToMany(() => Contract, contract => contract.destinationPlanet)
  public destinationContracts : Array<Contract>;

  public getContracts() : Array<Contract> {
    return [...this.originContracts, ...this.destinationContracts];
  }

  @OneToMany(() => Pilot, pilot => pilot.currentLocation)
  public currentPilots : Array<Pilot>;

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