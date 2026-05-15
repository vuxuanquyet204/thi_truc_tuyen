import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_spacing.dart';

/// Academic Luminary Avatar Component
/// Supports normal, with status badge, with glow effect
class ALAvatar extends StatelessWidget {
  const ALAvatar({
    super.key,
    required this.imageUrl,
    this.name,
    this.size,
    this.showBorder = false,
    this.borderColor,
    this.status,
    this.glowColor,
    this.glowIntensity,
  });

  final String? imageUrl;
  final String? name;
  final double? size;
  final bool showBorder;
  final Color? borderColor;
  final ALAvatarStatus? status;
  final Color? glowColor;
  final double? glowIntensity;

  double get _size => size ?? AppSpacing.avatarMd;

  @override
  Widget build(BuildContext context) {
    Widget avatar = _buildAvatarImage();

    // Apply glow effect (for proctoring status)
    if (glowColor != null) {
      avatar = Container(
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: glowColor!.withValues(alpha: glowIntensity ?? 0.3),
              blurRadius: 12,
              spreadRadius: 0,
            ),
          ],
        ),
        child: avatar,
      );
    }

    // Apply border
    if (showBorder) {
      avatar = Container(
        padding: const EdgeInsets.all(2),
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: borderColor ?? AppColors.surfaceContainerHighest,
        ),
        child: avatar,
      );
    }

    // Stack status badge if provided
    if (status != null) {
      avatar = Stack(
        clipBehavior: Clip.none,
        children: [
          avatar,
          Positioned(
            right: 0,
            bottom: 0,
            child: _buildStatusBadge(),
          ),
        ],
      );
    }

    return avatar;
  }

  Widget _buildAvatarImage() {
    if (imageUrl != null && imageUrl!.isNotEmpty) {
      return ClipOval(
        child: Image.network(
          imageUrl!,
          width: _size,
          height: _size,
          fit: BoxFit.cover,
          errorBuilder: (_, __, ___) => _buildPlaceholder(),
        ),
      );
    }
    return _buildPlaceholder();
  }

  Widget _buildPlaceholder() {
    return Container(
      width: _size,
      height: _size,
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerHighest,
        shape: BoxShape.circle,
      ),
      child: Center(
        child: Text(
          _getInitials(),
          style: TextStyle(
            fontFamily: 'Manrope',
            fontSize: _size * 0.4,
            fontWeight: FontWeight.w700,
            color: AppColors.primary,
          ),
        ),
      ),
    );
  }

  String _getInitials() {
    if (name == null || name!.isEmpty) return '?';
    final parts = name!.trim().split(' ');
    if (parts.length == 1) return parts[0][0].toUpperCase();
    return '${parts[0][0]}${parts[parts.length - 1][0]}'.toUpperCase();
  }

  Widget _buildStatusBadge() {
    final badgeSize = _size * 0.3;
    return Container(
      width: badgeSize,
      height: badgeSize,
      decoration: BoxDecoration(
        color: status!.color,
        shape: BoxShape.circle,
        border: Border.all(
          color: AppColors.surfaceContainerLowest,
          width: 2,
        ),
      ),
    );
  }
}

/// Avatar status for online/offline/away states
enum ALAvatarStatus {
  online(Color(0xFF22C55E)),
  offline(Color(0xFF6B7280)),
  away(Color(0xFFF59E0B));

  const ALAvatarStatus(this.color);
  final Color color;
}

/// Group avatar (avatar stack like in admin dashboard)
class ALAvatarGroup extends StatelessWidget {
  const ALAvatarGroup({
    super.key,
    required this.avatars,
    this.maxDisplay = 3,
    this.size,
  });

  final List<String?> avatars;
  final int maxDisplay;
  final double? size;

  double get _size => size ?? AppSpacing.avatarSm;

  @override
  Widget build(BuildContext context) {
    final displayAvatars = avatars.take(maxDisplay).toList();
    final remaining = avatars.length - maxDisplay;

    return Row(
      children: [
        for (int i = 0; i < displayAvatars.length; i++)
          Padding(
            padding: EdgeInsets.only(left: i * _size * 0.6),
            child: ALAvatar(
              imageUrl: displayAvatars[i],
              size: _size,
              showBorder: true,
              borderColor: AppColors.surface,
            ),
          ),
        if (remaining > 0)
          Padding(
            padding: EdgeInsets.only(left: _size * 0.5),
            child: Container(
              width: _size,
              height: _size,
              decoration: BoxDecoration(
                color: AppColors.surfaceContainerHighest,
                shape: BoxShape.circle,
                border: Border.all(
                  color: AppColors.surface,
                  width: 2,
                ),
              ),
              child: Center(
                child: Text(
                  '+$remaining',
                  style: TextStyle(
                    fontSize: _size * 0.35,
                    fontWeight: FontWeight.w700,
                    color: AppColors.onSurface,
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }
}
