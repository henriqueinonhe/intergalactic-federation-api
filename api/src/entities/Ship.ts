import { Column, CreateDateColumn, Entity, OneToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { v4 as uuid } from "uuid";
import { Pilot } from "./Pilot";

@Entity("Ships")
export class Ship {
  @PrimaryColumn({
    type: "varchar",
    nullable: false
  })
  public id : string;

  @Column({
    type: "int",
    nullable: false
  })
  public fuelCapacity : number;

  @Column({
    type: "int",
    nullable: false
  })
  public fuelLevel : number;

  @Column({
    type: "int",
    nullable: false
  })
  public weightCapacity : number;

  @Column({
    type: "int",
    nullable: false
  })
  public currentWeight : number;

  @OneToOne(() => Pilot, pilot => pilot.ship)
  public pilot : Pilot;

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