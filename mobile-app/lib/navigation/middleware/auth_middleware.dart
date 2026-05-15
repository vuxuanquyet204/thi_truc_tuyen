import 'package:flutter/material.dart';

/// Auth guard middleware — redirects unauthenticated users
class AuthGuard extends GoRouteGuard {
  const AuthGuard();

  @override
  Future<void> redirect(
    BuildContext context,
    GoRouterState state,
  ) async {
    // TODO: Implement actual auth check via AuthContext
    // For now, allow all routes
    return null;
  }
}

/// Role guard middleware — ensures user has correct role
class RoleGuard extends GoRouteGuard {
  const RoleGuard(this.allowedRoles);

  final List<String> allowedRoles;

  @override
  Future<void> redirect(
    BuildContext context,
    GoRouterState state,
  ) async {
    // TODO: Implement role check via AuthContext
    return null;
  }
}
