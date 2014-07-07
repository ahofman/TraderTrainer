using System.Web.Optimization;

[assembly: WebActivatorEx.PostApplicationStartMethod(typeof(TraderTrainer.WebUI.App_Start.TraderTrainerBundleConfig), "RegisterBundles")]

namespace TraderTrainer.WebUI.App_Start
{
    public class TraderTrainerBundleConfig
    {
        public static void RegisterBundles()
        {
            BundleTable.Bundles.Add(new ScriptBundle("~/Scripts/tradertrainer").Include("~/Scripts/tradertrainer.chart.js"));
        }
    }
}
