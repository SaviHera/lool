import { onRequest } from "firebase-functions/v2/https";

// Mock user data
const mockUsers = [
  {
    id: 1,
    name: "Sarah Chen",
    email: "sarah.chen@example.com",
    role: "Admin",
    status: "Active",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
  },
  {
    id: 2,
    name: "Marcus Johnson",
    email: "marcus.j@example.com",
    role: "Developer",
    status: "Active",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    email: "emily.r@example.com",
    role: "Designer",
    status: "Active",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
  },
  {
    id: 4,
    name: "David Kim",
    email: "david.kim@example.com",
    role: "Developer",
    status: "Pending",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
  },
  {
    id: 5,
    name: "Lisa Thompson",
    email: "lisa.t@example.com",
    role: "Manager",
    status: "Active",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
  },
  {
    id: 6,
    name: "James Wilson",
    email: "james.w@example.com",
    role: "Developer",
    status: "Inactive",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
  },
];

// API endpoint to get users
export const api = onRequest({ cors: true }, (request, response) => {
  const path = request.path;

  // Health check endpoint
  if (path === "/api/health" || path === "/health") {
    response.json({
      success: true,
      message: "API is running",
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Users endpoint
  if (path === "/api/users" || path === "/users") {
    response.json({
      success: true,
      message: "Users fetched successfully",
      data: mockUsers,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Default response for unknown paths
  response.status(404).json({
    success: false,
    message: `Endpoint not found: ${path}`,
    availableEndpoints: ["/api/users", "/api/health"],
  });
});

