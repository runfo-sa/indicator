package com.example.indicator

import org.junit.Assert.assertEquals
import org.junit.Test

class StarterMessageTest {
    @Test
    fun starterMessageIsClear() {
        assertEquals("Android app starter", starterMessage())
    }
}
