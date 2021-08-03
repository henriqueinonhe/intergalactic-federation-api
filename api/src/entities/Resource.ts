import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { Contract } from "./Contract";
import { v4 as uuid } from "uuid";

@Entity("Resources")
export class Resource {
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

  @Column({
    type: "int",
    nullable: false
  })
  public weight : number;

  @Column({
    type: "varchar",
    nullable: true
  })
  public contractId : string | null;
  
  @ManyToOne(() => Contract, contract => contract.payload)
  public contract : Contract | null;

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