import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { Planet } from "./Planet";

@Entity()
export class TravellingData {
  @PrimaryColumn({
    type: "varchar",
    nullable: false
  })
  public id : string;

  // @Column({
  //   type: "varchar",
  //   nullable: false
  // })
  // public originPlanetId : string;

  @ManyToOne(() => Planet)
  public originPlanet : Planet;

  // @Column({
  //   type: "varchar",
  //   nullable: false
  // })
  // public destinationPlanetId : string;

  @ManyToOne(() => Planet)
  public destinationPlanet : Planet;

  @Column({
    type: "int",
    nullable: false
  })
  public fuelConsumption : number;

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
}