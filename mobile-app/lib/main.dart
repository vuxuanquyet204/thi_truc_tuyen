import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

import 'core/theme/app_theme.dart';
import 'contexts/auth_context.dart';
import 'infrastructure/storage/secure_storage.dart';
import 'infrastructure/storage/local_storage.dart';
import 'navigation/app_router.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Set preferred orientations
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // Set system UI overlay style
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      statusBarBrightness: Brightness.light,
    ),
  );

  // Initialize storage
  await LocalStorageService.instance.init();

  // Create auth context
  final secureStorage = SecureStorageService.instance;
  final authContext = AuthContext(secureStorage);

  // Check existing auth state
  await authContext.checkAuthState();

  runApp(
    AcademicLuminaryApp(authContext: authContext),
  );
}

class AcademicLuminaryApp extends StatefulWidget {
  const AcademicLuminaryApp({
    super.key,
    required this.authContext,
  });

  final AuthContext authContext;

  @override
  State<AcademicLuminaryApp> createState() => _AcademicLuminaryAppState();
}

class _AcademicLuminaryAppState extends State<AcademicLuminaryApp> {
  late final _router = AppRouter.createRouter(widget.authContext);

  @override
  void dispose() {
    _router.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider.value(value: widget.authContext),
      ],
      child: MaterialApp.router(
        title: 'Academic Luminary',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light,
        routerConfig: _router,
        builder: (context, child) {
          // Apply global font overlay
          return MediaQuery(
            data: MediaQuery.of(context).copyWith(
              textScaler: TextScaler.noScaling,
            ),
            child: child ?? const SizedBox(),
          );
        },
      ),
    );
  }
}
