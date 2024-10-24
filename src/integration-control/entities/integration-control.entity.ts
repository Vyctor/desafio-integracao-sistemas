import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({
  name: 'integration_control',
})
export class IntegrationControl {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  filename: string;

  @Column()
  @Index()
  hash: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;
}
