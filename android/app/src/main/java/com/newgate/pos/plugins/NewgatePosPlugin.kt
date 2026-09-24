package com.newgate.pos.plugins

import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.newgate.pos.hardware.NewgateHardwareBridge
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.spec.GCMParameterSpec
import android.util.Base64

@CapacitorPlugin(name = "NewgatePosPlugin")
class NewgatePosPlugin : Plugin() {

    private lateinit var hardwareBridge: NewgateHardwareBridge
    private val keyAlias = "newgate_device_credential"

    override fun load() {
        super.load()
        hardwareBridge = NewgateHardwareBridge(context, activity)
    }

    @PluginMethod
    fun pulseCashDrawer(call: PluginCall) {
        val printerIp = call.getString("printerIp") ?: "192.168.1.200"
        val printerPort = call.getInt("printerPort") ?: 9100
        hardwareBridge.pulseCashDrawerAsync(printerIp, printerPort) { success ->
            val ret = JSObject()
            ret.put("success", success)
            call.resolve(ret)
        }
    }

    @PluginMethod
    fun beep(call: PluginCall) {
        val freq = call.getInt("toneFrequency") ?: 2000
        val duration = call.getInt("durationMs") ?: 100
        hardwareBridge.beep(freq, duration)
        call.resolve()
    }

    @PluginMethod
    fun setLockTaskMode(call: PluginCall) {
        val enabled = call.getBoolean("enabled") ?: false
        val success = hardwareBridge.setLockTaskMode(enabled)
        val ret = JSObject()
        ret.put("success", success)
        call.resolve(ret)
    }

    @PluginMethod
    fun getBatteryLevel(call: PluginCall) {
        val level = hardwareBridge.getBatteryLevel()
        val ret = JSObject()
        ret.put("batteryLevel", level)
        call.resolve(ret)
    }

    @PluginMethod
    fun sendCustomerDisplay(call: PluginCall) {
        val line1 = call.getString("line1") ?: ""
        val line2 = call.getString("line2") ?: ""
        val success = hardwareBridge.sendCustomerDisplay(line1, line2)
        val ret = JSObject()
        ret.put("success", success)
        call.resolve(ret)
    }

    @PluginMethod
    fun printReceipt(call: PluginCall) {
        val transport = call.getString("transport") ?: "NETWORK_ESCPOS"
        if (transport != "NETWORK_ESCPOS") {
            val ret = JSObject()
            ret.put("status", "OFFLINE")
            call.resolve(ret)
            return
        }
        val printerIp = call.getString("printerIp") ?: "192.168.1.200"
        val printerPort = call.getInt("printerPort") ?: 9100
        val rawText = call.getString("rawText") ?: ""
        hardwareBridge.printRawEscPosAsync(printerIp, printerPort, rawText.toByteArray(Charsets.UTF_8)) { status ->
            val ret = JSObject()
            ret.put("status", status)
            call.resolve(ret)
        }
    }

    fun barcodeScanned(barcode: String) {
        val ret = JSObject()
        ret.put("barcode", barcode)
        notifyListeners("barcodeScanned", ret)
    }

    @PluginMethod
    fun sqliteSet(call: PluginCall) {
        val key = call.getString("key") ?: run {
            call.reject("Missing key")
            return
        }
        val valueJson = call.getString("value") ?: ""
        val dbHelper = com.newgate.pos.db.NewgatePosDbHelper.getInstance(context)
        dbHelper.setConfig(key, valueJson)
        val ret = JSObject()
        ret.put("success", true)
        call.resolve(ret)
    }

    @PluginMethod
    fun sqliteGet(call: PluginCall) {
        val key = call.getString("key") ?: run {
            call.reject("Missing key")
            return
        }
        val dbHelper = com.newgate.pos.db.NewgatePosDbHelper.getInstance(context)
        val value = dbHelper.getConfig(key)
        val ret = JSObject()
        ret.put("value", value)
        call.resolve(ret)
    }

    @PluginMethod
    fun secureSet(call: PluginCall) {
        val key = call.getString("key") ?: return call.reject("Missing key")
        val value = call.getString("value") ?: ""
        try {
            val cipher = Cipher.getInstance("AES/GCM/NoPadding")
            cipher.init(Cipher.ENCRYPT_MODE, getSecretKey())
            val encrypted = cipher.doFinal(value.toByteArray(Charsets.UTF_8))
            val payload = Base64.encodeToString(cipher.iv, Base64.NO_WRAP) + ":" + Base64.encodeToString(encrypted, Base64.NO_WRAP)
            getPreferences().edit().putString(key, payload).apply()
            call.resolve()
        } catch (error: Exception) { call.reject("Secure storage failed", error) }
    }

    @PluginMethod
    fun secureGet(call: PluginCall) {
        val key = call.getString("key") ?: return call.reject("Missing key")
        try {
            val stored = getPreferences().getString(key, null)
            if (stored == null) { call.resolve(JSObject().put("value", null)); return }
            val parts = stored.split(":", limit = 2)
            val cipher = Cipher.getInstance("AES/GCM/NoPadding")
            cipher.init(Cipher.DECRYPT_MODE, getSecretKey(), GCMParameterSpec(128, Base64.decode(parts[0], Base64.NO_WRAP)))
            val value = String(cipher.doFinal(Base64.decode(parts[1], Base64.NO_WRAP)), Charsets.UTF_8)
            call.resolve(JSObject().put("value", value))
        } catch (error: Exception) { call.reject("Secure storage read failed", error) }
    }

    private fun getPreferences() = context.getSharedPreferences("newgate_secure", android.content.Context.MODE_PRIVATE)

    private fun getSecretKey(): javax.crypto.SecretKey {
        val keyStore = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
        if (!keyStore.containsAlias(keyAlias)) {
            val generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore")
            generator.init(KeyGenParameterSpec.Builder(keyAlias, KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT).setBlockModes(KeyProperties.BLOCK_MODE_GCM).setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE).build())
            generator.generateKey()
        }
        return (keyStore.getEntry(keyAlias, null) as KeyStore.SecretKeyEntry).secretKey
    }
}
