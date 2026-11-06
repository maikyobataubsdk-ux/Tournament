class Tournament {
  final String id;
  final String title;
  final String description;
  final String mode;
  final String map;
  final int maxSlots;
  final int registeredSlots;
  final String tournamentDate;
  final String status;

  Tournament({
    required this.id,
    required this.title,
    required this.description,
    required this.mode,
    required this.map,
    required this.maxSlots,
    required this.registeredSlots,
    required this.tournamentDate,
    required this.status,
  });

  factory Tournament.fromJson(Map<String, dynamic> json) {
    return Tournament(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      mode: json['mode'] ?? 'Solo',
      map: json['map'] ?? 'Bermuda',
      maxSlots: json['max_slots'] ?? 48,
      registeredSlots: json['registered_slots'] ?? 0,
      tournamentDate: json['tournament_date'] ?? '',
      status: json['status'] ?? 'PUBLISHED',
    );
  }
}

class MatchItem {
  final String id;
  final String tournamentId;
  final int matchNumber;
  final String map;
  final String scheduledAt;
  final String? roomId;
  final String? roomPassword;
  final String status;

  MatchItem({
    required this.id,
    required this.tournamentId,
    required this.matchNumber,
    required this.map,
    required this.scheduledAt,
    this.roomId,
    this.roomPassword,
    required this.status,
  });

  factory MatchItem.fromJson(Map<String, dynamic> json) {
    return MatchItem(
      id: json['id'] ?? '',
      tournamentId: json['tournament_id'] ?? '',
      matchNumber: json['match_number'] ?? 1,
      map: json['map'] ?? 'Bermuda',
      scheduledAt: json['scheduled_at'] ?? '',
      roomId: json['room_id'],
      roomPassword: json['room_password'],
      status: json['status'] ?? 'SCHEDULED',
    );
  }
}

class LeaderboardPlayer {
  final int rank;
  final String playerName;
  final String freeFireNickname;
  final int matchesPlayed;
  final int wins;
  final int eliminations;
  final int totalPoints;

  LeaderboardPlayer({
    required this.rank,
    required this.playerName,
    required this.freeFireNickname,
    required this.matchesPlayed,
    required this.wins,
    required this.eliminations,
    required this.totalPoints,
  });

  factory LeaderboardPlayer.fromJson(Map<String, dynamic> json) {
    return LeaderboardPlayer(
      rank: json['rank'] ?? 0,
      playerName: json['player_name'] ?? 'Player',
      freeFireNickname: json['free_fire_nickname'] ?? '',
      matchesPlayed: json['matches_played'] ?? 0,
      wins: json['wins'] ?? 0,
      eliminations: json['eliminations'] ?? 0,
      totalPoints: json['total_points'] ?? 0,
    );
  }
}
