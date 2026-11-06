import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'screens/auth_screen.dart';
import 'screens/main_navigation.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const BooyahEsportsApp());
}

class BooyahEsportsApp extends StatelessWidget {
  const BooyahEsportsApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Booyahesports',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF0B0E14),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFFFF5500),
          secondary: Color(0xFF00FFCC),
          surface: Color(0xFF121722),
        ),
        cardColor: const Color(0xFF121722),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF0B0E14),
          elevation: 0,
          centerTitle: false,
        ),
      ),
      home: const SplashScreen(),
    );
  }
}

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _checkInitialState();
  }

  Future<void> _checkInitialState() async {
    await Future.delayed(const Duration(seconds: 1));
    final token = await ApiService.getToken();
    if (!mounted) return;

    if (token != null) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const MainNavigation()),
      );
    } else {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const AuthScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Image.asset(
              'assets/logo.png',
              width: 110,
              height: 110,
              errorBuilder: (_, __, ___) => const Icon(Icons.sports_esports, size: 80, color: Color(0xFFFF5500)),
            ),
            const SizedBox(height: 24),
            const Text(
              'BOOYAHESPORTS',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w900,
                fontStyle: FontStyle.italic,
                letterSpacing: 2,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Free Fire MAX Esports Arena',
              style: TextStyle(color: Colors.grey, fontSize: 12),
            ),
            const SizedBox(height: 32),
            const CircularProgressIndicator(color: Color(0xFFFF5500)),
          ],
        ),
      ),
    );
  }
}
