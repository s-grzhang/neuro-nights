import Foundation
import DeviceActivity
import ManagedSettings
import FamilyControls

@objc(PhoneUsageModule)
class PhoneUsageModule: NSObject {
  
  @objc static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
  @objc func hasPermission(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    // Check if the app has authorization to access Screen Time data
    if #available(iOS 15.0, *) {
      AuthorizationCenter.shared.getAuthorizationStatus { status in
        resolve(status == .approved)
      }
    } else {
      // Screen Time API is only available in iOS 15+
      resolve(false)
    }
  }
  
  @objc func requestPermission(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    // Request authorization to access Screen Time data
    if #available(iOS 15.0, *) {
      Task {
        do {
          try await AuthorizationCenter.shared.requestAuthorization(for: .individual)
          resolve(true)
        } catch {
          reject("ERROR", "Failed to request authorization: \(error.localizedDescription)", error)
        }
      }
    } else {
      // Screen Time API is only available in iOS 15+
      reject("ERROR", "Screen Time API requires iOS 15 or later", nil)
    }
  }
  
  @objc func getPhonePickups(_ days: NSNumber, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    if #available(iOS 15.0, *) {
      // Get the start date (n days ago)
      let daysInt = days.intValue
      let calendar = Calendar.current
      let endDate = Date()
      guard let startDate = calendar.date(byAdding: .day, value: -daysInt, to: endDate) else {
        reject("ERROR", "Failed to calculate start date", nil)
        return
      }
      
      // Set up the schedule for device activity monitoring
      let schedule = DeviceActivitySchedule(
        intervalStart: DateComponents(hour: 0, minute: 0),
        intervalEnd: DateComponents(hour: 23, minute: 59),
        repeats: true
      )
      
      // Create the device activity center
      let center = DeviceActivityCenter()
      
      // Query device activity data
      Task {
        do {
          // Get phone pickup data
          let result: [[String: Any]] = []
          // Note: As of iOS 16, there is no direct API to get phone pickups
          // We would need to implement a custom solution using DeviceActivityMonitor
          // This would require a more complex implementation that's beyond the scope of this example
          
          // Return placeholder data for now
          let placeholderData = (0..<daysInt).map { i -> [String: Any] in
            guard let date = calendar.date(byAdding: .day, value: -i, to: endDate) else {
              return [:]
            }
            return [
              "date": date.description,
              "pickups": Int.random(in: 20...70),
              "screenTimeHours": Double.random(in: 1...6)
            ]
          }
          
          resolve(placeholderData)
        } catch {
          reject("ERROR", "Failed to get phone pickups: \(error.localizedDescription)", error)
        }
      }
    } else {
      // Screen Time API is only available in iOS 15+
      reject("ERROR", "Screen Time API requires iOS 15 or later", nil)
    }
  }
  
  @objc func getNightPickups(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    if #available(iOS 15.0, *) {
      // Create a dictionary to hold the result
      var result: [String: Any] = [:]
      
      // For now, return placeholder data
      // Note: In a real implementation, we would need to track device pickups
      // during night hours (10 PM - 7 AM) using DeviceActivityMonitor
      result["nightDisruptions"] = Int.random(in: 0...3)
      result["sleepDuration"] = Double.random(in: 6...9)
      
      resolve(result)
    } else {
      // Screen Time API is only available in iOS 15+
      reject("ERROR", "Screen Time API requires iOS 15 or later", nil)
    }
  }
} 