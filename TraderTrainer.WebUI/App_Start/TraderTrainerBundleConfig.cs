using System.Web.Optimization;

[assembly: WebActivatorEx.PostApplicationStartMethod(typeof(TraderTrainer.WebUI.App_Start.TraderTrainerBundleConfig), "RegisterBundles")]

namespace TraderTrainer.WebUI.App_Start
{
    public class TraderTrainerBundleConfig
    {
        public static void RegisterBundles()
        {
            BundleTable.Bundles.Add(new ScriptBundle("~/Scripts/tradertrainer")
                .Include("~/Scripts/tradertrainer.stock.js")
                .Include("~/Scripts/tradertrainer.chart.js")
                .Include("~/Scripts/tradertrainer.js"));

            BundleTable.Bundles.Add(new StyleBundle("~/Content/TraderTrainer").Include("~/Content/TraderTrainer.css"));
        }
    }
}
