import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/theme/app_spacing.dart';

/// LearnToken Screen — Balance + Rewards Shop + Transaction History
class LearnTokenScreen extends StatelessWidget {
  const LearnTokenScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        backgroundColor: AppColors.surface,
        body: NestedScrollView(
          headerSliverBuilder: (context, innerBoxIsScrolled) => [
            SliverToBoxAdapter(
              child: Container(
                height: AppSpacing.progressRibbonHeight,
                color: AppColors.secondary.withValues(alpha: 0.5),
              ),
            ),
            SliverToBoxAdapter(child: _BalanceHeroCard()),
            SliverToBoxAdapter(child: _BalanceStatsRow()),
            SliverPersistentHeader(
              pinned: true,
              delegate: _SliverTabBarDelegate(
                TabBar(
                  controller: DefaultTabController.of(context),
                  labelColor: AppColors.primary,
                  unselectedLabelColor: AppColors.onSurfaceVariant,
                  indicatorColor: AppColors.primary,
                  indicatorWeight: 3,
                  tabs: const [
                    Tab(text: 'Cửa hàng'),
                    Tab(text: 'Lịch sử'),
                  ],
                ),
              ),
            ),
          ],
          body: TabBarView(
            children: [
              _RewardsGrid(),
              _TransactionHistory(),
            ],
          ),
        ),
      ),
    );
  }
}

class _SliverTabBarDelegate extends SliverPersistentHeaderDelegate {
  _SliverTabBarDelegate(this._tabBar);
  final TabBar _tabBar;

  @override
  double get minExtent => _tabBar.preferredSize.height;
  @override
  double get maxExtent => _tabBar.preferredSize.height;

  @override
  Widget build(context, shrinkOffset, overlapsContent) {
    return Container(
      color: AppColors.surface,
      child: _tabBar,
    );
  }

  @override
  bool shouldRebuild(_SliverTabBarDelegate oldDelegate) => false;
}

class _BalanceHeroCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(AppSpacing.screenPadding),
      padding: const EdgeInsets.all(AppSpacing.cardPadding),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [AppColors.primary, AppColors.primaryContainer],
        ),
        borderRadius: AppRadius.radiusBento,
        boxShadow: AppColors.ambientShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'TỔNG SỐ DƯ KHẢ DỤNG',
            style: TextStyle(
              fontFamily: 'Inter', fontSize: 11, fontWeight: FontWeight.w600,
              color: AppColors.onPrimaryContainer, letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              const Text('1,250', style: TextStyle(
                fontFamily: 'Manrope', fontSize: 48, fontWeight: FontWeight.w800,
                color: AppColors.onPrimary, letterSpacing: -0.02,
              )),
              const Padding(
                padding: EdgeInsets.only(bottom: 8),
                child: Text(' LT', style: TextStyle(
                  fontFamily: 'Manrope', fontSize: 20, fontWeight: FontWeight.w700,
                  color: AppColors.tertiaryFixedDim,
                )),
              ),
            ],
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.redeem, size: 18),
                  label: const Text('Đổi quà ngay'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.tertiaryFixedDim,
                    foregroundColor: AppColors.onTertiaryFixed,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: AppRadius.radiusFull),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: OutlinedButton(
                  onPressed: () {},
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.onPrimary,
                    side: BorderSide(color: Colors.white.withValues(alpha: 0.3)),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: AppRadius.radiusFull),
                  ),
                  child: const Text('Tìm thêm LT'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _BalanceStatsRow extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.screenPadding),
      child: Row(
        children: [
          Expanded(
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.surfaceContainerLowest,
                borderRadius: AppRadius.radiusBento,
                boxShadow: AppColors.cardShadow,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppColors.secondaryContainer,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(Icons.trending_up, color: AppColors.onSecondaryContainer, size: 18),
                      ),
                      const SizedBox(width: 8),
                      Text('Đã kiếm được', style: TextStyle(
                        fontFamily: 'Inter', fontSize: 12, color: AppColors.onSurfaceVariant,
                      )),
                    ],
                  ),
                  const SizedBox(height: 8),
                  const Text('4,850 LT', style: TextStyle(
                    fontFamily: 'Manrope', fontSize: 20, fontWeight: FontWeight.w800,
                    color: AppColors.onSurface,
                  )),
                ],
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.surfaceContainerLowest,
                borderRadius: AppRadius.radiusBento,
                boxShadow: AppColors.cardShadow,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppColors.errorContainer,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(Icons.payments, color: AppColors.onErrorContainer, size: 18),
                      ),
                      const SizedBox(width: 8),
                      Text('Đã chi tiêu', style: TextStyle(
                        fontFamily: 'Inter', fontSize: 12, color: AppColors.onSurfaceVariant,
                      )),
                    ],
                  ),
                  const SizedBox(height: 8),
                  const Text('3,600 LT', style: TextStyle(
                    fontFamily: 'Manrope', fontSize: 20, fontWeight: FontWeight.w800,
                    color: AppColors.onSurface,
                  )),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _RewardsGrid extends StatelessWidget {
  final _rewards = const [
    _RewardData('Khóa học AI Fundamentals', '800 LT', 'assets/images/placeholder.png'),
    _RewardData('Chứng chỉ Data Science', '1,500 LT', 'assets/images/placeholder.png'),
    _RewardData('Voucher học phí 50%', '300 LT', 'assets/images/placeholder.png'),
    _RewardData('Bộ Kit Học Tập', '2,000 LT', 'assets/images/placeholder.png'),
  ];

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      padding: const EdgeInsets.all(AppSpacing.screenPadding),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 0.75,
      ),
      itemCount: _rewards.length,
      itemBuilder: (context, index) {
        return _RewardCard(reward: _rewards[index]);
      },
    );
  }
}

class _RewardData {
  const _RewardData(this.title, this.price, this.imageUrl);
  final String title;
  final String price;
  final String imageUrl;
}

class _RewardCard extends StatelessWidget {
  const _RewardCard({required this.reward});

  final _RewardData reward;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        borderRadius: AppRadius.radiusBento,
        boxShadow: AppColors.cardShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                color: AppColors.surfaceContainerHighest,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(32),
                  topRight: Radius.circular(32),
                ),
              ),
              child: Center(
                child: Icon(
                  Icons.card_giftcard,
                  size: 48,
                  color: AppColors.primary.withValues(alpha: 0.5),
                ),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  reward.title,
                  style: const TextStyle(
                    fontFamily: 'Manrope', fontSize: 13, fontWeight: FontWeight.w700,
                    color: AppColors.onSurface,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.tertiaryFixedDim,
                    borderRadius: AppRadius.radiusFull,
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.stars, size: 12, color: AppColors.onTertiaryFixed),
                      const SizedBox(width: 4),
                      Text(reward.price, style: const TextStyle(
                        fontFamily: 'Inter', fontSize: 11, fontWeight: FontWeight.w700,
                        color: AppColors.onTertiaryFixed,
                      )),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _TransactionHistory extends StatelessWidget {
  final _transactions = const [
    _TransactionData('Hoàn thành bài thi UX Design', '+250 LT', '15 Tháng 5, 2024', true),
    _TransactionData('Đổi quà: Voucher Amazon', '-1,200 LT', '12 Tháng 5, 2024', false),
    _TransactionData('Thưởng chuyên cần: 7 ngày', '+50 LT', '10 Tháng 5, 2024', true),
    _TransactionData('Top 10 Bảng xếp hạng Tuần', '+100 LT', '08 Tháng 5, 2024', true),
  ];

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.all(AppSpacing.screenPadding),
      itemCount: _transactions.length,
      separatorBuilder: (_, __) => const Divider(height: 1, color: Colors.transparent),
      itemBuilder: (context, index) {
        final t = _transactions[index];
        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.surfaceContainerLowest,
            borderRadius: AppRadius.radiusLg,
          ),
          child: Row(
            children: [
              Container(
                width: 44, height: 44,
                decoration: BoxDecoration(
                  color: t.isEarned
                      ? AppColors.secondaryContainer.withValues(alpha: 0.3)
                      : AppColors.errorContainer.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  t.isEarned ? Icons.school : Icons.shopping_bag,
                  color: t.isEarned ? AppColors.secondary : AppColors.error,
                  size: 22,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(t.title, style: const TextStyle(
                      fontFamily: 'Inter', fontSize: 13, fontWeight: FontWeight.w700,
                      color: AppColors.onSurface,
                    )),
                    Text(t.date, style: TextStyle(
                      fontFamily: 'Inter', fontSize: 11, color: AppColors.onSurfaceVariant,
                    )),
                  ],
                ),
              ),
              Text(
                t.amount,
                style: TextStyle(
                  fontFamily: 'Manrope', fontSize: 16, fontWeight: FontWeight.w800,
                  color: t.isEarned ? AppColors.secondary : AppColors.error,
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _TransactionData {
  const _TransactionData(this.title, this.amount, this.date, this.isEarned);
  final String title;
  final String amount;
  final String date;
  final bool isEarned;
}
