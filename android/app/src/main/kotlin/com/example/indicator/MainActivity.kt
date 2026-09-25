package com.example.indicator

import android.app.Activity
import android.os.Bundle
import android.view.Gravity
import android.widget.TextView

class MainActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(TextView(this).apply {
            text = starterMessage()
            textSize = 20f
            gravity = Gravity.CENTER
        })
    }
}

internal fun starterMessage() = "Android app starter"
