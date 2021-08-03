import { Column, CreateDateColumn, Entity, JoinColumn,  ManyToOne, OneToMany, OneToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { v4 as uuid } from "uuid";
import { Contract } from "./Contract";
import { Planet } from "./Planet";
import { Refill } from "./Refill";
import { Ship } from "./Ship";

@Entity("Pilots")
export class Pilot {
  @PrimaryColumn({
    type: "varchar"
  })
  public id : string;

  @Column({
    type: "varchar",
    nullable: true
  })
  public certification : string | null;

  @Column({
    type: "varchar",
    nullable: false
  })
  public name : string;

  @Column({
    type: "varchar",
    nullable: false
  })
  public age : number;

  @Column({
    type: "decimal",
    precision: 21,
    scale: 4,
    nullable: false
  })
  public credits : string;

  @Column({
    type: "varchar",
    nullable: false
  })
  public currentLocationId : string;

  @ManyToOne(() => Planet, planet => planet.currentPilots)
  public currentLocation : Planet;

  @Column({
    type: "varchar",
    nullable: false
  })
  public shipId : string | null;

  @OneToOne(() => Ship, ship => ship.pilot)
  @JoinColumn()
  public ship : Ship | null;

  @OneToMany(() => Contract, contract => contract.contractee)
  public contracts : Array<Contract>;

  @OneToMany(() => Refill, refill => refill.pilot)
  public refills : Array<Refill>;

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