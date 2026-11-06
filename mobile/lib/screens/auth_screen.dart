import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'main_navigation.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  bool isLogin = true;
  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  bool loading = false;
  String? error;

  Future<void> submit() async {
    final email = emailController.text.trim();
    final pwd = passwordController.text.trim();

    if (email.isEmpty) {
      setState(() => error = 'Please enter your email');
      return;
    }
    if (pwd.length != 8 || !RegExp(r'^\d+$').hasMatch(pwd)) {
      setState(() => error = 'Password must be exactly 8 numeric digits');
      return;
    }

    setState(() {
      loading = true;
      error = null;
    });

    try {
      if (isLogin) {
        await ApiService.login(email, pwd);
      } else {
        await ApiService.register(email, pwd);
      }
      if (!mounted) return;
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const MainNavigation()),
      );
    } catch (e) {
      setState(() => error = e.toString().replaceAll('Exception: ', ''));
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(28.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Image.asset(
                  'assets/logo.png',
                  width: 80,
                  height: 80,
                  errorBuilder: (_, __, ___) => const Icon(Icons.flash_on, size: 60, color: Color(0xFFFF5500)),
                ),
                const SizedBox(height: 16),
                Text(
                  isLogin ? 'WELCOME BACK' : 'CREATE ACCOUNT',
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, fontStyle: FontStyle.italic),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Booyahesports.in • Non-Gambling Tournament Arena',
                  style: TextStyle(color: Colors.grey, fontSize: 11),
                ),
                const SizedBox(height: 32),

                if (error != null)
                  Container(
                    padding: const EdgeInsets.all(12),
                    margin: const EdgeInsets.only(bottom: 16),
                    decoration: BoxDecoration(
                      color: Colors.red.withAlpha(38),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: Colors.red.withAlpha(80)),
                    ),
                    child: Text(
                      error!,
                      style: const TextStyle(color: Colors.redAccent, fontSize: 12),
                      textAlign: TextAlign.center,
                    ),
                  ),

                TextField(
                  controller: emailController,
                  keyboardType: TextInputType.emailAddress,
                  style: const TextStyle(fontSize: 13),
                  decoration: InputDecoration(
                    labelText: 'Email Address',
                    filled: true,
                    fillColor: const Color(0xFF121722),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 16),

                TextField(
                  controller: passwordController,
                  keyboardType: TextInputType.number,
                  obscureText: true,
                  maxLength: 8,
                  style: const TextStyle(fontSize: 13),
                  decoration: InputDecoration(
                    labelText: '8-Digit Numeric Password',
                    helperText: 'Must contain exactly 8 digits (e.g. 12345678)',
                    filled: true,
                    fillColor: const Color(0xFF121722),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 24),

                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: loading ? null : submit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFFF5500),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: loading
                        ? const CircularProgressIndicator(color: Colors.white)
                        : Text(
                            isLogin ? 'LOGIN TO PLAY' : 'REGISTER NOW',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                          ),
                  ),
                ),
                const SizedBox(height: 16),

                TextButton(
                  onPressed: () => setState(() {
                    isLogin = !isLogin;
                    error = null;
                  }),
                  child: Text(
                    isLogin ? "Don't have an account? Register" : 'Already have an account? Login',
                    style: const TextStyle(color: Color(0xFFFF5500), fontSize: 12),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
