import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  avatar: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: User[];
  timestamp: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'Lool';
  users = signal<User[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  lastUpdated = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.loading.set(true);
    this.error.set(null);

    this.http.get<ApiResponse>('/api/users').subscribe({
      next: (response) => {
        this.users.set(response.data);
        this.lastUpdated.set(response.timestamp);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to fetch data from API. Please try again.');
        this.loading.set(false);
        console.error('API Error:', err);
      },
    });
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return 'status-active';
      case 'inactive':
        return 'status-inactive';
      case 'pending':
        return 'status-pending';
      default:
        return '';
    }
  }

  getRoleBadgeClass(role: string): string {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'role-admin';
      case 'developer':
        return 'role-developer';
      case 'designer':
        return 'role-designer';
      case 'manager':
        return 'role-manager';
      default:
        return 'role-default';
    }
  }
}

