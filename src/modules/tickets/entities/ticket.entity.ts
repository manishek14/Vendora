import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "../../../database/entities/user.entity";

@Entity("Tickets")
export class Ticket {
    @PrimaryGeneratedColumn()
    id : number

    @Column()
    title : string

    @Column()
    subject : string

    @ManyToOne(() => User)
    user : User

    @ManyToOne(() => Ticket, (ticket) => ticket.replies, { nullable : true })
    replyTo : Ticket

    @OneToMany(() => Ticket, (ticket) => ticket.replyTo)
    replies : Ticket[]
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
    
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
