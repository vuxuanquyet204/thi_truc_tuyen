import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_spacing.dart';

/// Academic Luminary Custom App Bar
/// Clean top bar without elevation
class ALAppBar extends StatelessWidget implements PreferredSizeWidget {
  const ALAppBar({
    super.key,
    this.title,
    this.titleWidget,
    this.leading,
    this.actions,
    this.centerTitle = false,
    this.backgroundColor,
    this.automaticallyImplyLeading = true,
  });

  final String? title;
  final Widget? titleWidget;
  final Widget? leading;
  final List<Widget>? actions;
  final bool centerTitle;
  final Color? backgroundColor;
  final bool automaticallyImplyLeading;

  @override
  Size get preferredSize => const Size.fromHeight(AppSpacing.appBarHeight);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: backgroundColor ?? AppColors.surface,
      elevation: 0,
      scrolledUnderElevation: 0,
      centerTitle: centerTitle,
      automaticallyImplyLeading: automaticallyImplyLeading,
      leading: leading,
      title: titleWidget ??
          (title != null
              ? Text(
                  title!,
                  style: const TextStyle(
                    fontFamily: 'Manrope',
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                    letterSpacing: -0.02,
                    color: AppColors.primary,
                  ),
                )
              : null),
      actions: actions,
    );
  }
}

/// Simple top bar for screens that don't need full AppBar
class ALTopBar extends StatelessWidget {
  const ALTopBar({
    super.key,
    required this.left,
    required this.right,
    this.backgroundColor,
    this.height,
  });

  final Widget left;
  final Widget right;
  final Color? backgroundColor;
  final double? height;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height ?? AppSpacing.appBarHeight,
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.base),
      color: backgroundColor ?? AppColors.surface,
      child: Row(
        children: [
          left,
          const Spacer(),
          right,
        ],
      ),
    );
  }
}
