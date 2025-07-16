import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Room } from './room.entity';

export enum StreamStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ENDED = 'ended',
  ERROR = 'error'
}

export enum StreamType {
  WEBRTC = 'webrtc',
  RTMP = 'rtmp',
  HLS = 'hls'
}

@Entity()
export class Stream {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'simple-enum',
    enum: StreamStatus,
    default: StreamStatus.INACTIVE
  })
  status: StreamStatus;

  @Column({
    type: 'simple-enum',
    enum: StreamType,
    default: StreamType.WEBRTC
  })
  type: StreamType;

  @Column({ default: 0 })
  viewerCount: number;

  @Column({ nullable: true })
  rtmpUrl: string;

  @Column({ nullable: true })
  hlsUrl: string;

  @Column({ unique: true, nullable: true })
  streamKey: string;

  @Column({ nullable: true })
  webrtcSessionId: string;

  @Column({ type: 'text', nullable: true })
  metadata: string; // JSON string for additional data

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  endedAt: Date;

  @ManyToOne(() => User, user => user.streams)
  @JoinColumn()
  streamer: User;

  @ManyToOne(() => Room, room => room.streams)
  @JoinColumn()
  room: Room;
}
