import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Stream } from './stream.entity';

export enum RoomType {
  PUBLIC = 'public',
  PRIVATE = 'private',
  INVITE_ONLY = 'invite_only'
}

@Entity()
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'simple-enum',
    enum: RoomType,
    default: RoomType.PUBLIC
  })
  type: RoomType;

  @Column({ default: 0 })
  viewerCount: number;

  @Column({ default: 100 })
  maxViewers: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  thumbnail: string;

  @Column({ nullable: true })
  streamKey: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, user => user.ownedRooms)
  @JoinColumn()
  owner: User;

  @OneToMany(() => Stream, stream => stream.room)
  streams: Stream[];
}
