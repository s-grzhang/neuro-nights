import com.neuronights.PhoneUsageModule;

public class MainApplication extends ReactApplication {

  @Override
  protected String getMainComponentName() {
    return "MainApplication";
  }

  @Override
  protected ReactNativeHost createReactNativeHost() {
    return new ReactNativeHost(this) {
      @Override
      public boolean getUseDeveloperSupport() {
        return BuildConfig.DEBUG;
      }

      @Override
      protected List<ReactPackage> getPackages() {
        List<ReactPackage> packages = new PackageList(this).getPackages();
        packages.add(new PhoneUsagePackage());
        return packages;
      }

      @Override
      protected String getJSMainModuleName() {
        return "index";
      }
    };
  }

  @Override
  public ReactNativeHost getReactNativeHost() {
    return createReactNativeHost();
  }
} 