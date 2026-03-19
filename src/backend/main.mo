import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Option "mo:core/Option";
import Text "mo:core/Text";
import Stack "mo:core/Stack";
import Queue "mo:core/Queue";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Time "mo:core/Time";
import List "mo:core/List";
import Int "mo:core/Int";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";

actor {
  include MixinStorage();

  // Types
  public type Video = {
    id : Text;
    title : Text;
    description : Text;
    hashtags : [Text];
    blobKey : Storage.ExternalBlob;
    thumbnailKey : Storage.ExternalBlob;
    creator : Principal;
    likesCount : Nat;
    commentsCount : Nat;
    sharesCount : Nat;
    savesCount : Nat;
    musicName : Text;
    duration : Nat;
    isRemoved : Bool;
    reportCount : Nat;
    createdAt : Time.Time;
    score : Nat;
  };

  public type Comment = {
    videoId : Text;
    author : Principal;
    text : Text;
    createdAt : Time.Time;
  };

  public type Like = {
    userId : Principal;
    videoId : Text;
  };

  public type Notification = {
    userId : Principal;
    message : Text;
    isRead : Bool;
    createdAt : Time.Time;
  };

  public type Report = {
    targetId : Text;
    reporterId : Principal;
    createdAt : Time.Time;
  };

  public type UserProfile = {
    username : Text;
    bio : Text;
    avatarBlobKey : ?Storage.ExternalBlob;
    followerCount : Nat;
    followingCount : Nat;
    isBanned : Bool;
    createdAt : Time.Time;
  };

  public type PartialUserProfile = {
    username : Text;
    bio : Text;
    avatarBlobKey : ?Storage.ExternalBlob;
    followerCount : Nat;
    followingCount : Nat;
  };

  public type Follow = {
    follower : Principal;
    followee : Principal;
  };

  // State
  let videos = Map.empty<Text, Video>();
  let comments = Map.empty<Text, List.List<Comment>>();
  let likes = Map.empty<Text, List.List<Like>>();
  let notifications = Map.empty<Text, List.List<Notification>>();
  let reports = Map.empty<Text, List.List<Report>>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let follows = Map.empty<Principal, List.List<Follow>>();
  let trendingHashtagsMap = Map.empty<Text, Nat>();

  // Initialize authorization state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  module Video {
    public func compare(video1 : Video, video2 : Video) : Order.Order {
      Text.compare(video1.id, video2.id);
    };
  };

  module Comment {
    public func compare(comment1 : Comment, comment2 : Comment) : Order.Order {
      switch (Int.compare(comment1.createdAt, comment2.createdAt)) {
        case (#equal) { Text.compare(comment1.text, comment2.text) };
        case (order) { order };
      };
    };
  };

  // Helper function to check if user is banned
  private func isUserBanned(user : Principal) : Bool {
    switch (userProfiles.get(user)) {
      case (null) { false };
      case (?profile) { profile.isBanned };
    };
  };

  // Helper function to verify user exists and is not banned
  private func verifyActiveUser(caller : Principal) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can perform this action");
    };

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) {
        if (profile.isBanned) {
          Runtime.trap("User is banned");
        };
      };
    };
  };

  // User Functions
  public shared ({ caller }) func register(username : Text, bio : Text, avatarBlobKey : ?Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can register");
    };

    if (userProfiles.containsKey(caller)) { Runtime.trap("User already exists.") };

    let profile = {
      username;
      bio;
      avatarBlobKey;
      followerCount = 0;
      followingCount = 0;
      isBanned = false;
      createdAt = Time.now();
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getProfile(user : Principal) : async PartialUserProfile {
    // Anyone can view profiles, but not banned status
    switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?profile) {
        {
          username = profile.username;
          bio = profile.bio;
          avatarBlobKey = profile.avatarBlobKey;
          followerCount = profile.followerCount;
          followingCount = profile.followingCount;
        };
      };
    };
  };

  public query ({ caller }) func getMyProfile() : async PartialUserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their profile");
    };

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) {
        {
          username = profile.username;
          bio = profile.bio;
          avatarBlobKey = profile.avatarBlobKey;
          followerCount = profile.followerCount;
          followingCount = profile.followingCount;
        };
      };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async PartialUserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their profile");
    };

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) {
        {
          username = profile.username;
          bio = profile.bio;
          avatarBlobKey = profile.avatarBlobKey;
          followerCount = profile.followerCount;
          followingCount = profile.followingCount;
        };
      };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async PartialUserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile or admin access required");
    };

    switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) {
        {
          username = profile.username;
          bio = profile.bio;
          avatarBlobKey = profile.avatarBlobKey;
          followerCount = profile.followerCount;
          followingCount = profile.followingCount;
        };
      };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(username : Text, bio : Text, avatarBlobKey : ?Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    verifyActiveUser(caller);

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) {
        let updatedProfile = {
          profile with
          username = username;
          bio = bio;
          avatarBlobKey = avatarBlobKey;
        };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };

  public shared ({ caller }) func followUser(followee : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can follow others");
    };

    verifyActiveUser(caller);

    if (caller == followee) {
      Runtime.trap("Cannot follow yourself");
    };

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?_) {
        switch (userProfiles.get(followee)) {
          case (null) { Runtime.trap("Followee does not exist") };
          case (?followeeProfile) {
            if (followeeProfile.isBanned) {
              Runtime.trap("Cannot follow banned user");
            };

            let followerList = switch (follows.get(caller)) {
              case (null) { List.empty<Follow>() };
              case (?list) { list };
            };
            followerList.add({
              follower = caller;
              followee;
            });
            follows.add(caller, followerList);

            let updatedProfile = {
              followeeProfile with followerCount = followeeProfile.followerCount + 1;
            };
            userProfiles.add(followee, updatedProfile);
          };
        };
      };
    };
  };

  public query ({ caller }) func getFollowingUsers(user : Principal) : async [Principal] {
    // Anyone can view following list
    switch (follows.get(user)) {
      case (null) { [] };
      case (?followList) {
        followList.toArray().map(func(f : Follow) : Principal { f.followee });
      };
    };
  };

  public query ({ caller }) func getTrendingVideos() : async [Video] {
    // Anyone including guests can view trending videos
    let videoArray = videos.values().toArray().filter(
      func(v : Video) : Bool { not v.isRemoved }
    ).sort();
    videoArray.sliceToArray(0, 10);
  };

  public query ({ caller }) func searchVideos(searchTerm : Text) : async [Video] {
    // Anyone including guests can search videos
    let allVideos = videos.values().toArray();
    let filteredVideos = allVideos.filter(
      func(video) {
        not video.isRemoved and video.title.contains(#text searchTerm)
      }
    );
    filteredVideos;
  };

  public query ({ caller }) func searchUsers(searchTerm : Text) : async [(Principal, PartialUserProfile)] {
    // Anyone including guests can search users
    let filteredUsers = userProfiles.entries().filter(
      func((_, user)) {
        not user.isBanned and user.username.contains(#text searchTerm);
      }
    ).map(func((p, u)) {
      (p, {
        username = u.username;
        bio = u.bio;
        avatarBlobKey = u.avatarBlobKey;
        followerCount = u.followerCount;
        followingCount = u.followingCount;
      });
    });
    filteredUsers.toArray();
  };

  public query ({ caller }) func searchHashtags(searchTerm : Text) : async [Text] {
    // Anyone including guests can search hashtags
    let allHashtags = trendingHashtagsMap.keys().toArray();
    let filteredHashtags = allHashtags.filter(
      func(hashtag) { hashtag.contains(#text searchTerm) }
    );
    filteredHashtags;
  };

  public query ({ caller }) func getTrendingHashtags() : async [Text] {
    // Anyone including guests can view trending hashtags
    trendingHashtagsMap.keys().toArray();
  };

  public query ({ caller }) func getVideoComments(videoId : Text) : async [Comment] {
    // Anyone including guests can view comments
    switch (comments.get(videoId)) {
      case (null) { [] };
      case (?videoComments) {
        videoComments.reverse().toArray();
      };
    };
  };

  public query ({ caller }) func getUserVideos(user : Principal) : async [Video] {
    // Anyone including guests can view user videos
    let filteredVideos = videos.values().filter(
      func(video) {
        video.creator == user and not video.isRemoved;
      }
    );

    filteredVideos.toArray();
  };

  public shared ({ caller }) func uploadVideo(
    id : Text,
    title : Text,
    description : Text,
    hashtags : [Text],
    blobKey : Storage.ExternalBlob,
    thumbnailKey : Storage.ExternalBlob,
    musicName : Text,
    duration : Nat
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload videos");
    };

    verifyActiveUser(caller);

    if (videos.containsKey(id)) {
      Runtime.trap("Video ID already exists");
    };

    let video : Video = {
      id;
      title;
      description;
      hashtags;
      blobKey;
      thumbnailKey;
      creator = caller;
      likesCount = 0;
      commentsCount = 0;
      sharesCount = 0;
      savesCount = 0;
      musicName;
      duration;
      isRemoved = false;
      reportCount = 0;
      createdAt = Time.now();
      score = 0;
    };

    videos.add(id, video);
  };

  public shared ({ caller }) func likeVideo(videoId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like videos");
    };

    verifyActiveUser(caller);

    switch (videos.get(videoId)) {
      case (null) { Runtime.trap("Video not found") };
      case (?video) {
        if (video.isRemoved) {
          Runtime.trap("Cannot like removed video");
        };

        let videoLikes = switch (likes.get(videoId)) {
          case (null) { List.empty<Like>() };
          case (?list) { list };
        };

        videoLikes.add({ userId = caller; videoId });
        likes.add(videoId, videoLikes);

        let updatedVideo = {
          video with likesCount = video.likesCount + 1;
        };
        videos.add(videoId, updatedVideo);
      };
    };
  };

  public shared ({ caller }) func addComment(videoId : Text, text : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can comment");
    };

    verifyActiveUser(caller);

    switch (videos.get(videoId)) {
      case (null) { Runtime.trap("Video not found") };
      case (?video) {
        if (video.isRemoved) {
          Runtime.trap("Cannot comment on removed video");
        };

        let comment : Comment = {
          videoId;
          author = caller;
          text;
          createdAt = Time.now();
        };

        let videoComments = switch (comments.get(videoId)) {
          case (null) { List.empty<Comment>() };
          case (?list) { list };
        };

        videoComments.add(comment);
        comments.add(videoId, videoComments);

        let updatedVideo = {
          video with commentsCount = video.commentsCount + 1;
        };
        videos.add(videoId, updatedVideo);
      };
    };
  };

  public shared ({ caller }) func reportVideo(videoId : Text, reason : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can report videos");
    };

    verifyActiveUser(caller);

    switch (videos.get(videoId)) {
      case (null) { Runtime.trap("Video not found") };
      case (?video) {
        let report : Report = {
          targetId = videoId;
          reporterId = caller;
          createdAt = Time.now();
        };

        let videoReports = switch (reports.get(videoId)) {
          case (null) { List.empty<Report>() };
          case (?list) { list };
        };

        videoReports.add(report);
        reports.add(videoId, videoReports);

        let updatedVideo = {
          video with reportCount = video.reportCount + 1;
        };
        videos.add(videoId, updatedVideo);
      };
    };
  };

  public query ({ caller }) func getNotifications() : async [Notification] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view notifications");
    };

    verifyActiveUser(caller);

    switch (notifications.get(caller.toText())) {
      case (null) { [] };
      case (?notifList) { notifList.toArray() };
    };
  };

  // Admin Functions
  public shared ({ caller }) func banUser(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can ban users");
    };

    switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) {
        let updatedProfile = {
          profile with isBanned = true;
        };
        userProfiles.add(user, updatedProfile);
      };
    };
  };

  public shared ({ caller }) func removeVideo(videoId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can remove videos");
    };

    switch (videos.get(videoId)) {
      case (null) { Runtime.trap("Video not found") };
      case (?video) {
        let updatedVideo = {
          video with isRemoved = true;
        };
        videos.add(videoId, updatedVideo);
      };
    };
  };

  public query ({ caller }) func getAllUsers() : async [(Principal, PartialUserProfile)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };

    userProfiles.entries().map<((Principal, UserProfile)), (Principal, PartialUserProfile)>(func((p, u)) {
      (p, {
        username = u.username;
        bio = u.bio;
        avatarBlobKey = u.avatarBlobKey;
        followerCount = u.followerCount;
        followingCount = u.followingCount;
      });
    }).toArray();
  };

  public query ({ caller }) func getAnalytics() : async {
    totalUsers : Nat;
    totalVideos : Nat;
    totalReports : Nat;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view analytics");
    };

    {
      totalUsers = userProfiles.size();
      totalVideos = videos.size();
      totalReports = reports.size();
    };
  };
};
