plugins {
    id("com.android.application")
}

android {
    namespace = "com.example.indicator"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.example.indicator"
        minSdk = 30
        targetSdk = 36
        versionCode = 1
        versionName = "0.1.0"
    }
}

dependencies {
    testImplementation("junit:junit:4.13.2")
}
