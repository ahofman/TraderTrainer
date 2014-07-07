using System.Web.Optimization;

[assembly: WebActivatorEx.PostApplicationStartMethod(typeof(TraderTrainer.WebUI.App_Start.JQueryBundleConfig), "RegisterBundles")]

namespace TraderTrainer.WebUI.App_Start
{
    public class JQueryBundleConfig
    {
        public static void RegisterBundles()
        {
            BundleTable.Bundles.Add(new ScriptBundle("~/Scripts/jquery").Include("~/Scripts/jquery-1.10.2.js"));
        }
    }
}
