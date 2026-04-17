package com.strnge.clashwidget.widget

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.pm.PackageManager
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class WidgetPickerModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "WidgetPicker"

    @ReactMethod
    fun addWidget(type: String) {
        val context = reactApplicationContext
        val appWidgetManager = AppWidgetManager.getInstance(context)

        val componentName = when (type) {
            "builder" -> ComponentName(context, BuilderStatusWidget::class.java)
            "multi" -> ComponentName(context, MultiAccountWidget::class.java)
            "lab" -> ComponentName(context, LabWidget::class.java)
            "pet" -> ComponentName(context, PetWidget::class.java)
            else -> null
        }

        if (componentName == null) return

        if (appWidgetManager.isRequestPinAppWidgetSupported) {
            appWidgetManager.requestPinAppWidget(componentName, null, null)
        }
    }

    private fun setWidgetEnabled(
        className: Class<*>,
        enabled: Boolean
    ) {
        val context = reactApplicationContext
        val component = ComponentName(context, className)

        val state = if (enabled) {
            PackageManager.COMPONENT_ENABLED_STATE_ENABLED
        } else {
            PackageManager.COMPONENT_ENABLED_STATE_DISABLED
        }

        context.packageManager.setComponentEnabledSetting(
            component,
            state,
            PackageManager.DONT_KILL_APP
        )
    }

    @ReactMethod
    fun updateWidgetAccess(isPro: Boolean) {

        // Free widgets
        setWidgetEnabled(BuilderStatusWidget::class.java, true)
        setWidgetEnabled(MultiAccountWidget::class.java, true)

        // Pro widgets
        setWidgetEnabled(LabWidget::class.java, isPro)
        setWidgetEnabled(PetWidget::class.java, isPro)
    }
}