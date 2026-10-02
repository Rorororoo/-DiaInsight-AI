"""SHAP helpers built on shap.TreeExplainer (real values, never hardcoded)."""
import numpy as np, shap

class Explainer:
    def __init__(self, model, X_test, features):
        self.features = features
        self.explainer = shap.TreeExplainer(model)
        self.global_values = self._class1(self.explainer.shap_values(X_test))
        self.X_test = X_test

    @staticmethod
    def _class1(sv):
        """Return SHAP values for the positive class (handles list or 3-D array output)."""
        if isinstance(sv, list):
            return np.asarray(sv[1])
        sv = np.asarray(sv)
        return sv[..., 1] if sv.ndim == 3 else sv

    def local(self, row_df):
        vals = self._class1(self.explainer.shap_values(row_df))[0]
        ev = np.atleast_1d(self.explainer.expected_value)
        base = float(ev[1] if len(ev) > 1 else ev[0])
        items = [{"feature": f, "value": float(row_df.iloc[0][f]), "shap": float(v),
                  "direction": "increase" if v > 0 else "decrease"} for f, v in zip(self.features, vals)]
        return base, sorted(items, key=lambda d: abs(d["shap"]), reverse=True)

    def global_importance(self):
        m = np.abs(self.global_values).mean(axis=0)
        return sorted([{"feature": f, "mean_abs_shap": float(v)} for f, v in zip(self.features, m)],
                      key=lambda d: d["mean_abs_shap"], reverse=True)

    def summary_points(self, limit=80):
        """Per-feature beeswarm data: SHAP value + normalised feature value (0-1)."""
        out = {}
        for i, f in enumerate(self.features):
            col = self.X_test[f].to_numpy(); rng = (col.max() - col.min()) or 1
            out[f] = [{"shap": float(s), "norm": float((v - col.min()) / rng)}
                      for s, v in list(zip(self.global_values[:, i], col))[:limit]]
        return out
