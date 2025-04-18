package com.neuronights;

import android.app.usage.UsageEvents;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.Intent;
import android.provider.Settings;
import android.util.Log;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;

public class PhoneUsageModule extends ReactContextBaseJavaModule {
    private static final String TAG = "PhoneUsageModule";

    public PhoneUsageModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "PhoneUsageModule";
    }

    @ReactMethod
    public void hasUsagePermission(Promise promise) {
        try {
            UsageStatsManager usageStatsManager = (UsageStatsManager) getReactApplicationContext()
                    .getSystemService(Context.USAGE_STATS_SERVICE);
            
            Calendar calendar = Calendar.getInstance();
            long endTime = calendar.getTimeInMillis();
            calendar.add(Calendar.DAY_OF_MONTH, -1);
            long startTime = calendar.getTimeInMillis();
            
            UsageEvents usageEvents = usageStatsManager.queryEvents(startTime, endTime);
            boolean hasPermission = usageEvents != null && usageEvents.hasNextEvent();
            promise.resolve(hasPermission);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void requestUsagePermission(Promise promise) {
        try {
            Intent intent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getReactApplicationContext().startActivity(intent);
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void getPhonePickups(int days, Promise promise) {
        try {
            UsageStatsManager usageStatsManager = (UsageStatsManager) getReactApplicationContext()
                    .getSystemService(Context.USAGE_STATS_SERVICE);
            
            Calendar calendar = Calendar.getInstance();
            long endTime = calendar.getTimeInMillis();
            calendar.add(Calendar.DAY_OF_MONTH, -days);
            long startTime = calendar.getTimeInMillis();
            
            List<Long> screenOnTimes = new ArrayList<>();
            List<Long> screenOffTimes = new ArrayList<>();
            
            UsageEvents usageEvents = usageStatsManager.queryEvents(startTime, endTime);
            UsageEvents.Event event = new UsageEvents.Event();
            
            while (usageEvents.hasNextEvent()) {
                usageEvents.getNextEvent(event);
                
                if (event.getEventType() == UsageEvents.Event.SCREEN_INTERACTIVE) {
                    screenOnTimes.add(event.getTimeStamp());
                } else if (event.getEventType() == UsageEvents.Event.SCREEN_NON_INTERACTIVE) {
                    screenOffTimes.add(event.getTimeStamp());
                }
            }
            
            // Process the data and calculate pickups
            WritableArray pickupData = processPickupData(screenOnTimes, screenOffTimes);
            promise.resolve(pickupData);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    private WritableArray processPickupData(List<Long> screenOnTimes, List<Long> screenOffTimes) {
        WritableArray result = new WritableNativeArray();
        
        // Calculate daily pickups
        // Note: This is a simplified algorithm. In a production app,
        // you would need more sophisticated logic to handle edge cases.
        
        Calendar calendar = Calendar.getInstance();
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        
        // Last 7 days
        for (int i = 0; i < 7; i++) {
            WritableMap dayData = new WritableNativeMap();
            long dayStart = calendar.getTimeInMillis();
            calendar.add(Calendar.DAY_OF_MONTH, -1);
            long dayEnd = calendar.getTimeInMillis();
            
            int pickups = 0;
            long totalScreenOnTime = 0;
            Long lastScreenOffTime = null;
            
            // Count pickups for this day
            for (int j = 0; j < screenOnTimes.size(); j++) {
                Long onTime = screenOnTimes.get(j);
                
                if (onTime >= dayEnd && onTime < dayStart) {
                    pickups++;
                    
                    // Find corresponding screen off time
                    for (Long offTime : screenOffTimes) {
                        if (offTime > onTime && (lastScreenOffTime == null || offTime < lastScreenOffTime)) {
                            lastScreenOffTime = offTime;
                        }
                    }
                    
                    if (lastScreenOffTime != null) {
                        totalScreenOnTime += (lastScreenOffTime - onTime);
                        lastScreenOffTime = null;
                    }
                }
            }
            
            // Add day data
            dayData.putString("date", calendar.getTime().toString());
            dayData.putInt("pickups", pickups);
            dayData.putDouble("screenTimeHours", totalScreenOnTime / (1000.0 * 60.0 * 60.0));
            result.pushMap(dayData);
        }
        
        return result;
    }

    @ReactMethod
    public void getNightPickups(Promise promise) {
        try {
            UsageStatsManager usageStatsManager = (UsageStatsManager) getReactApplicationContext()
                    .getSystemService(Context.USAGE_STATS_SERVICE);
            
            Calendar calendar = Calendar.getInstance();
            long endTime = calendar.getTimeInMillis();
            calendar.add(Calendar.DAY_OF_MONTH, -1);
            long startTime = calendar.getTimeInMillis();
            
            List<Long> nightScreenOnTimes = new ArrayList<>();
            
            UsageEvents usageEvents = usageStatsManager.queryEvents(startTime, endTime);
            UsageEvents.Event event = new UsageEvents.Event();
            
            while (usageEvents.hasNextEvent()) {
                usageEvents.getNextEvent(event);
                
                if (event.getEventType() == UsageEvents.Event.SCREEN_INTERACTIVE) {
                    // Check if it's night time (between 10 PM and 7 AM)
                    Calendar eventTime = Calendar.getInstance();
                    eventTime.setTimeInMillis(event.getTimeStamp());
                    int hour = eventTime.get(Calendar.HOUR_OF_DAY);
                    
                    if (hour >= 22 || hour < 7) {
                        nightScreenOnTimes.add(event.getTimeStamp());
                    }
                }
            }
            
            WritableMap result = new WritableNativeMap();
            result.putInt("nightDisruptions", nightScreenOnTimes.size());
            
            if (nightScreenOnTimes.size() > 0) {
                // Find first and last pickup for calculating sleep duration
                Long firstPickup = null;
                Long lastDropoff = null;
                
                // Find earliest morning pickup (first pickup after 5 AM)
                for (Long time : nightScreenOnTimes) {
                    Calendar eventTime = Calendar.getInstance();
                    eventTime.setTimeInMillis(time);
                    int hour = eventTime.get(Calendar.HOUR_OF_DAY);
                    
                    if (hour >= 5 && hour < 10) {
                        if (firstPickup == null || time < firstPickup) {
                            firstPickup = time;
                        }
                    }
                }
                
                // Find latest night dropoff (last screen off before midnight)
                // Simplified: using the last screen on before midnight as an approximation
                for (Long time : nightScreenOnTimes) {
                    Calendar eventTime = Calendar.getInstance();
                    eventTime.setTimeInMillis(time);
                    int hour = eventTime.get(Calendar.HOUR_OF_DAY);
                    
                    if (hour >= 20 && hour < 24) {
                        if (lastDropoff == null || time > lastDropoff) {
                            lastDropoff = time;
                        }
                    }
                }
                
                if (firstPickup != null && lastDropoff != null) {
                    // Calculate sleep duration in hours
                    double sleepDuration = (firstPickup - lastDropoff) / (1000.0 * 60.0 * 60.0);
                    result.putDouble("sleepDuration", sleepDuration);
                }
            }
            
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }
} 