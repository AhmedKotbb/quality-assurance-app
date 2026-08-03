import {
  Column,
  CreatedAt,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { CementType, NarrationMode, Verdict } from '../../common/enums';

@Table({
  tableName: 'evaluation_reports',
  underscored: true,
})
export class EvaluationReport extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: CementType.ASTM_TYPE_I,
  })
  declare cementType: CementType;

  @Column({ type: DataType.STRING, allowNull: false })
  declare standardVersion: string;

  @Column({ type: DataType.JSONB, allowNull: false })
  declare inputPayload: Record<string, unknown>;

  @Column({ type: DataType.JSONB, allowNull: false })
  declare computedRatios: Record<string, unknown>;

  @Column({ type: DataType.JSONB, allowNull: false })
  declare boguePhases: Record<string, unknown>;

  @Column({ type: DataType.JSONB, allowNull: false })
  declare parameterResults: unknown[];

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare overallVerdict: Verdict;

  @Column({ type: DataType.JSONB, allowNull: true })
  declare recommendations: unknown[] | null;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: NarrationMode.TEMPLATE,
  })
  declare narrationMode: NarrationMode;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}
