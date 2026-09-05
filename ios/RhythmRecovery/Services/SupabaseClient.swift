import Foundation
import Supabase

enum SupabaseConfig {
    /// Reads `SupabaseURL`/`SupabaseAnonKey` from Info.plist, populated from
    /// Resources/Secrets.xcconfig (gitignored — see Secrets.xcconfig.example).
    static var url: URL {
        guard
            let raw = Bundle.main.object(forInfoDictionaryKey: "SupabaseURL") as? String,
            let url = URL(string: raw), url.scheme != nil
        else {
            fatalError("Missing/invalid SupabaseURL — copy Secrets.xcconfig.example to Secrets.xcconfig and fill in your project URL.")
        }
        return url
    }

    static var anonKey: String {
        guard
            let key = Bundle.main.object(forInfoDictionaryKey: "SupabaseAnonKey") as? String,
            !key.isEmpty
        else {
            fatalError("Missing SupabaseAnonKey — copy Secrets.xcconfig.example to Secrets.xcconfig and fill in your publishable anon key.")
        }
        return key
    }
}

extension SupabaseClient {
    /// The app-wide client, configured with PKCE and Keychain-backed session
    /// storage (never `UserDefaults`) so the refresh token stays out of plist-backed
    /// storage that other processes/backups can read more easily.
    static let shared = SupabaseClient(
        supabaseURL: SupabaseConfig.url,
        supabaseKey: SupabaseConfig.anonKey,
        options: SupabaseClientOptions(
            auth: SupabaseClientOptions.AuthOptions(flowType: .pkce)
        )
    )
}
