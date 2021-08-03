import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { Pilot } from "./Pilot";
import { v4 as uuid } from "uuid";

@Entity("Refill")
export class Refill {
  @PrimaryColumn({
    type: "varchar",
    nullable: false
  })
  public id : string;

  @Column({
    type: "integer",
    nullable: false
  })
  public amount : number;

  @Column({
    type: "varchar",
    nullable: false
  })
  public pilotId : string;

  @ManyToOne(() => Pilot, pilot => pilot.refills)
  public pilot : Pilot;

  @CreateDateColumn({
    type: "varchar",
    nullable: false
  })
  public createdAt : Date;

  @UpdateDateColumn({
    type: "varchar",
    nullable: false
  })
  public updatedAt : Date;

  constructor() {
    if(!this.id) {
      this.id = uuid();
    }
  }
}