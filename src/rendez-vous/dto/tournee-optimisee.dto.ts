import { RendezVousDto } from './rendez-vous.dto';

export class TourneeOptimiseeDto {
  dateOptimisation: Date;
  rendezVous: RendezVousDto[];
  clusters?: Array<{
    id: number;
    centroid: number[];
    count: number;
  }>;
}