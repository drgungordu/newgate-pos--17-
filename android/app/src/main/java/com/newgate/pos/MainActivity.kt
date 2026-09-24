package com.newgate.pos

import android.os.Bundle
import android.Manifest
import android.content.pm.PackageManager
import android.util.Log
import android.view.View
import android.view.WindowManager
import android.webkit.WebView
import com.getcapacitor.BridgeActivity
import com.newgate.pos.db.NewgatePosDbHelper
import com.newgate.pos.hardware.NewgateHardwareBridge
import com.newgate.pos.plugins.NewgatePosPlugin
import com.newgate.pos.admin.NewgateDevicePolicyManager

class MainActivity : BridgeActivity() {

    companion object {
        private const val TAG = "NewgatePOS"
    }

    private lateinit var hardwareBridge: NewgateHardwareBridge
    private lateinit var dbHelper: NewgatePosDbHelper

    private val keyBuffer = StringBuilder()
    private var lastKeyTimestamp = 0L

    override fun onCreate(savedInstanceState: Bundle?) {
        Log.i(TAG, "MainActivity started")

        // Register custom Newgate Hardware Plugin before super.onCreate
        registerPlugin(NewgatePosPlugin::class.java)
        super.onCreate(savedInstanceState)

        NewgateDevicePolicyManager(this).configureDedicatedDeviceKiosk()

        requestHardwarePermissions()

        Log.i(TAG, "Capacitor bridge ready")
        Log.i(TAG, "WebView loading index.html")

        // Enable remote debugging of WebView for emulator/inspection
        WebView.setWebContentsDebuggingEnabled(true)

        hardwareBridge = NewgateHardwareBridge(this, this)
        dbHelper = NewgatePosDbHelper.getInstance(this)

        // Keep screen awake for continuous POS operation
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

        // Apply sticky immersive mode for clean appliance POS look
        enableImmersiveMode()

        // Expose direct JS bridge for high-speed local calls, logging, and native SQLite access
        bridge?.webView?.addJavascriptInterface(
            object {
                @android.webkit.JavascriptInterface
                fun logInfo(tag: String, message: String) {
                    val logTag = if (tag.isNotBlank()) tag else TAG
                    Log.i(logTag, message)
                }

                @android.webkit.JavascriptInterface
                fun logError(tag: String, message: String) {
                    val logTag = if (tag.isNotBlank()) tag else "$TAG/Error"
                    Log.e(logTag, message)
                }

                @android.webkit.JavascriptInterface
                fun pulseCashDrawer(): Boolean = hardwareBridge.pulseCashDrawer()

                @android.webkit.JavascriptInterface
                fun beep(freq: Int, duration: Int) = hardwareBridge.beep(freq, duration)

                @android.webkit.JavascriptInterface
                fun setLockTaskMode(enabled: Boolean): Boolean = hardwareBridge.setLockTaskMode(enabled)

                @android.webkit.JavascriptInterface
                fun getBatteryLevel(): Int = hardwareBridge.getBatteryLevel()

                @android.webkit.JavascriptInterface
                fun sendCustomerDisplay(line1: String, line2: String): Boolean =
                    hardwareBridge.sendCustomerDisplay(line1, line2)

                @android.webkit.JavascriptInterface
                fun sqliteSet(key: String, valueJson: String): Boolean {
                    dbHelper.setConfig(key, valueJson)
                    return true
                }

                @android.webkit.JavascriptInterface
                fun sqliteGet(key: String): String? = dbHelper.getConfig(key)
            },
            "NewgateNativeBridge"
        )
    }

    private fun requestHardwarePermissions() {
        val permissions = mutableListOf(Manifest.permission.CAMERA)
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {
            permissions += Manifest.permission.BLUETOOTH_SCAN
            permissions += Manifest.permission.BLUETOOTH_CONNECT
        }
        val missing = permissions.filter { checkSelfPermission(it) != PackageManager.PERMISSION_GRANTED }
        if (missing.isNotEmpty()) requestPermissions(missing.toTypedArray(), 4101)
    }

    override fun onResume() {
        super.onResume()
        enableImmersiveMode()
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) {
            enableImmersiveMode()
        }
    }

    override fun dispatchKeyEvent(event: android.view.KeyEvent): Boolean {
        if (event.action == android.view.KeyEvent.ACTION_DOWN) {
            val now = System.currentTimeMillis()
            if (now - lastKeyTimestamp > 100) {
                keyBuffer.setLength(0)
            }
            lastKeyTimestamp = now

            val unicodeChar = event.unicodeChar
            if (event.keyCode == android.view.KeyEvent.KEYCODE_ENTER) {
                if (keyBuffer.length >= 3) {
                    val barcode = keyBuffer.toString().trim()
                    keyBuffer.setLength(0)
                    notifyBarcodeToWebView(barcode)
                    return true
                }
                keyBuffer.setLength(0)
            } else if (unicodeChar > 0) {
                keyBuffer.append(unicodeChar.toChar())
            }
        }
        return super.dispatchKeyEvent(event)
    }

    private fun notifyBarcodeToWebView(barcode: String) {
        hardwareBridge.beep(2800, 60)
        val js = "if (window.onNewgateBarcodeScanned) { window.onNewgateBarcodeScanned('${barcode.replace("'", "\\'")}'); }"
        runOnUiThread {
            bridge?.webView?.evaluateJavascript(js, null)
        }
    }

    private fun enableImmersiveMode() {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.R) {
            window.setDecorFitsSystemWindows(false)
            window.insetsController?.let { controller ->
                controller.hide(android.view.WindowInsets.Type.statusBars() or android.view.WindowInsets.Type.navigationBars())
                controller.systemBarsBehavior =
                    android.view.WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            }
        } else {
            @Suppress("DEPRECATION")
            window.decorView.systemUiVisibility = (
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_FULLSCREEN
            )
        }
    }
}
