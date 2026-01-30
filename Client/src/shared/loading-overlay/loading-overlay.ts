import { Component, inject } from '@angular/core';
import { LoadingService } from '../../core/services/loading-service';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [],
  templateUrl: './loading-overlay.html',
  styleUrl: './loading-overlay.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingOverlay {
  public loading = inject(LoadingService);
}
