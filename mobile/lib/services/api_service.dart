import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/models.dart';

class ApiService {
  static const String baseUrl = 'https://booyahesports.in/api/v1';
  static const int currentVersionCode = 1;

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }

  static Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
  }

  static Future<void> clearAuth() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
  }

  static Future<Map<String, dynamic>> register(String email, String password) async {
    final res = await http.post(
      Uri.parse('$baseUrl/auth/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'password': password,
        'confirm_password': password,
      }),
    );
    final data = jsonDecode(res.body);
    if (res.statusCode != 200) {
      throw Exception(data['detail'] ?? 'Registration failed');
    }
    await saveToken(data['access_token']);
    return data;
  }

  static Future<Map<String, dynamic>> login(String email, String password) async {
    final res = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    final data = jsonDecode(res.body);
    if (res.statusCode != 200) {
      throw Exception(data['detail'] ?? 'Login failed');
    }
    await saveToken(data['access_token']);
    return data;
  }

  static Future<List<Tournament>> fetchTournaments() async {
    final res = await http.get(Uri.parse('$baseUrl/tournaments'));
    if (res.statusCode == 200) {
      final List list = jsonDecode(res.body);
      return list.map((e) => Tournament.fromJson(e)).toList();
    }
    return [];
  }

  static Future<Map<String, dynamic>> fetchProfile() async {
    final token = await getToken();
    if (token == null) throw Exception('Not logged in');
    final res = await http.get(
      Uri.parse('$baseUrl/player/me'),
      headers: {'Authorization': 'Bearer $token'},
    );
    if (res.statusCode == 200) {
      return jsonDecode(res.body);
    }
    throw Exception('Failed to load profile');
  }

  static Future<void> updateProfile(String freeFireUid, String nickname) async {
    final token = await getToken();
    final res = await http.patch(
      Uri.parse('$baseUrl/player/me'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'free_fire_uid': freeFireUid,
        'free_fire_nickname': nickname,
      }),
    );
    if (res.statusCode != 200) {
      throw Exception('Failed to update profile');
    }
  }

  static Future<void> registerTournament(String tournamentId, {String? teamId}) async {
    final token = await getToken();
    final res = await http.post(
      Uri.parse('$baseUrl/tournaments/$tournamentId/register'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({'team_id': teamId}),
    );
    if (res.statusCode != 200) {
      final data = jsonDecode(res.body);
      throw Exception(data['detail'] ?? 'Registration failed');
    }
  }

  static Future<Map<String, dynamic>> fetchRoomDetails(String matchId) async {
    final token = await getToken();
    final res = await http.get(
      Uri.parse('$baseUrl/matches/$matchId/room-details'),
      headers: {'Authorization': 'Bearer $token'},
    );
    if (res.statusCode == 200) {
      return jsonDecode(res.body);
    }
    final data = jsonDecode(res.body);
    throw Exception(data['detail'] ?? 'Room not available');
  }

  static Future<List<LeaderboardPlayer>> fetchLeaderboard() async {
    final res = await http.get(Uri.parse('$baseUrl/leaderboard/global'));
    if (res.statusCode == 200) {
      final List list = jsonDecode(res.body);
      return list.map((e) => LeaderboardPlayer.fromJson(e)).toList();
    }
    return [];
  }

  static Future<Map<String, dynamic>?> checkAppUpdate() async {
    try {
      final res = await http.get(Uri.parse('$baseUrl/app/latest'));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        final latestCode = data['version_code'] ?? 1;
        if (latestCode > currentVersionCode) {
          return data;
        }
      }
    } catch (_) {}
    return null;
  }
}
